'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { ActionError } from '@/components/ui/action-error';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { REMINDER_PRESETS, dueDateFromPresetHours } from '@/lib/reminders/presets';
import { URGENCY_STYLES, getReminderUrgency } from '@/lib/reminders/urgency';
import type { Client, Reminder } from '@/lib/supabase/types';
import { useTranslations, useLocale } from 'next-intl';

const DONE_BADGE = 'bg-success-light text-success border-success/25';

type ReminderFormData = {
  client_id: string;
  message: string;
  date: string;
};

const emptyForm: ReminderFormData = {
  client_id: '',
  message: '',
  date: '',
};

const inputClass =
  'w-full px-4 py-2.5 bg-input border border-input-border rounded-lg text-foreground placeholder:text-muted text-sm';

function getClientName(reminder: Reminder, t: any): string {
  const clients = reminder.clients;
  if (!clients) return t('unknownClient');
  if (Array.isArray(clients)) return clients[0]?.name ?? t('unknownClient');
  return clients.name;
}

function formatDueDate(iso: string, locale: string): string {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timePart = d.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${datePart} · ${timePart}`;
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string {
  return new Date(value).toISOString();
}

function reminderToForm(reminder: Reminder): ReminderFormData {
  return {
    client_id: reminder.client_id,
    message: reminder.message,
    date: toDatetimeLocal(reminder.date),
  };
}

export default function RemindersPage() {
  const t = useTranslations('RemindersPage');
  const tUrgency = useTranslations('Status.urgency');
  const locale = useLocale();

  const [supabase] = useState(() => createClient());
  const { businessId, loading: businessLoading, error: businessError } = useBusiness(supabase);

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [clientOptions, setClientOptions] = useState<Pick<Client, 'id' | 'name'>[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Reminder | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loading = businessLoading || listLoading;
  const [saving, setSaving] = useState(false);
  const [markingDoneId, setMarkingDoneId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [form, setForm] = useState<ReminderFormData>(emptyForm);

  const fetchReminders = useCallback(async () => {
    if (!businessId) {
      setListLoading(false);
      return;
    }

    setListLoading(true);
    setLoadError('');

    const [remindersResult, clientsResult] = await Promise.all([
      supabase
        .from('reminders')
        .select('*, clients(name)')
        .eq('business_id', businessId)
        .order('done', { ascending: true })
        .order('date', { ascending: true }),
      supabase
        .from('clients')
        .select('id, name')
        .eq('business_id', businessId)
        .order('name', { ascending: true }),
    ]);

    if (remindersResult.error) {
      setLoadError(remindersResult.error.message);
      setReminders([]);
    } else {
      setReminders((remindersResult.data as Reminder[]) ?? []);
    }

    if (!clientsResult.error) {
      setClientOptions((clientsResult.data as Pick<Client, 'id' | 'name'>[]) ?? []);
    }

    setListLoading(false);
  }, [supabase, businessId]);

  useEffect(() => {
    if (businessLoading) return;
    if (businessError) {
      setLoadError(businessError);
      setListLoading(false);
      return;
    }
    void fetchReminders();
  }, [businessLoading, businessError, fetchReminders]);

  const applyPreset = (presetId: string) => {
    const preset = REMINDER_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    // We will assume presets are English but we could translate them
    // For now we just translate the message using t('presets.xxx')
    const translatedMsg = t(`presets.${presetId}`) || preset.message;
    setForm((f) => ({
      ...f,
      message: translatedMsg,
      date: toDatetimeLocal(dueDateFromPresetHours(preset.hoursFromNow)),
    }));
  };

  const openAddModal = () => {
    setEditingReminder(null);
    setForm({
      ...emptyForm,
      client_id: clientOptions[0]?.id ?? '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setForm(reminderToForm(reminder));
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingReminder(null);
    setForm(emptyForm);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    if (!form.client_id) {
      setFormError(t('modal.errorNoClient'));
      return;
    }

    const message = form.message.trim();
    if (!message) {
      setFormError(t('modal.errorNoMessage'));
      return;
    }

    if (!form.date) {
      setFormError(t('modal.errorNoDate'));
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      client_id: form.client_id,
      message,
      date: fromDatetimeLocal(form.date),
    };

    if (editingReminder) {
      const { error } = await supabase
        .from('reminders')
        .update(payload)
        .eq('id', editingReminder.id)
        .eq('business_id', businessId);

      if (error) {
        setFormError(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from('reminders').insert({
        ...payload,
        business_id: businessId,
      });

      if (error) {
        setFormError(error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    closeModal();
    await fetchReminders();
  };

  const handleMarkDone = async (reminder: Reminder) => {
    if (!businessId || reminder.done) return;

    setMarkingDoneId(reminder.id);

    const { error } = await supabase
      .from('reminders')
      .update({ done: true })
      .eq('id', reminder.id)
      .eq('business_id', businessId);

    setMarkingDoneId(null);

    if (error) {
      setActionError(error.message);
      return;
    }

    await fetchReminders();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !businessId) return;

    setDeleting(true);
    setActionError('');

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', deleteTarget.id)
      .eq('business_id', businessId);

    setDeleting(false);

    if (error) {
      setActionError(error.message);
      return;
    }

    setDeleteTarget(null);
    await fetchReminders();
  };

  const noClients = clientOptions.length === 0;
  const pendingCount = reminders.filter((r) => !r.done).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted">
            {loading
              ? t('header.loading')
              : t('header.count', { count: reminders?.length ?? 0 })}
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          disabled={loading || !businessId || noClients}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t('header.addButton')}
        </button>
      </div>

      {noClients && !loading && businessId && (
        <div className="bg-warning-light border border-warning/25 text-warning rounded-lg p-4 text-sm">
          {t('noClientsWarning')}{' '}
          <a href="/dashboard/clients" className="underline font-medium hover:text-foreground">
            {t('goToClients')}
          </a>
        </div>
      )}

      <ActionError message={actionError} onDismiss={() => setActionError('')} />

      {loadError && (
        <div className="bg-danger-light border border-danger/20 text-danger rounded-lg p-4 text-sm">
          {loadError}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <LoadingSpinner label={t('header.loading')} />
        ) : reminders.length === 0 && !loadError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">{t('empty.title')}</h2>
            <p className="text-muted text-sm max-w-sm mb-6">
              {t('empty.subtitle')}
            </p>
            <button
              type="button"
              onClick={openAddModal}
              disabled={!businessId || noClients}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t('empty.addButton')}
            </button>
          </div>
        ) : reminders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="text-start font-medium text-muted px-5 py-3.5">{t('table.clientName')}</th>
                  <th className="text-start font-medium text-muted px-5 py-3.5">{t('table.message')}</th>
                  <th className="text-start font-medium text-muted px-5 py-3.5">{t('table.dueDate')}</th>
                  <th className="text-start font-medium text-muted px-5 py-3.5">{t('table.status')}</th>
                  <th className="text-end font-medium text-muted px-5 py-3.5">{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reminders.map((reminder) => (
                  <tr
                    key={reminder.id}
                    className={`hover:bg-card-hover/50 transition-colors ${reminder.done ? 'opacity-70' : ''}`}
                  >
                    <td className="px-5 py-4 font-medium text-foreground">
                      {getClientName(reminder, t)}
                    </td>
                    <td className="px-5 py-4 text-muted max-w-xs truncate">{reminder.message}</td>
                    <td className="px-5 py-4 text-muted whitespace-nowrap">
                      {formatDueDate(reminder.date, locale)}
                    </td>
                    <td className="px-5 py-4">
                      {reminder.done ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${DONE_BADGE}`}
                        >
                          {t('table.done')}
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            URGENCY_STYLES[getReminderUrgency(reminder.date, reminder.done)].badge
                          }`}
                        >
                          {tUrgency(URGENCY_STYLES[getReminderUrgency(reminder.date, reminder.done)].id as any)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {!reminder.done && (
                          <button
                            type="button"
                            onClick={() => handleMarkDone(reminder)}
                            disabled={markingDoneId === reminder.id}
                            className="px-3 py-1.5 text-xs font-medium text-success bg-success-light border border-success/25 rounded-lg hover:bg-success/20 disabled:opacity-50 cursor-pointer"
                          >
                            {markingDoneId === reminder.id ? t('table.saving') : t('table.markDone')}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditModal(reminder)}
                          className="px-3 py-1.5 text-xs font-medium text-foreground bg-background border border-border rounded-lg hover:border-primary/40 hover:text-primary cursor-pointer"
                        >
                          {t('table.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(reminder)}
                          className="px-3 py-1.5 text-xs font-medium text-danger bg-danger-light border border-danger/20 rounded-lg hover:bg-danger/20 cursor-pointer"
                        >
                          {t('table.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('deleteConfirm.title')}
        message={deleteTarget ? t('deleteConfirm.message', { name: getClientName(deleteTarget, t) }) : ''}
        confirmLabel={t('deleteConfirm.confirm')}
        destructive
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />

      {modalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reminder-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
            onClick={closeModal}
            aria-label="Close modal"
          />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-5">
              <h2 id="reminder-modal-title" className="text-lg font-semibold text-foreground">
                {editingReminder ? t('modal.editTitle') : t('modal.addTitle')}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="p-1 text-muted hover:text-foreground rounded-lg disabled:opacity-50 cursor-pointer"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="bg-danger-light border border-danger/20 text-danger rounded-lg p-3 mb-4 text-sm">
                {formError}
              </div>
            )}

            {!editingReminder && (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted mb-2">{t('modal.quickPresets')}</p>
                <div className="flex flex-wrap gap-2">
                  {REMINDER_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:border-primary/40 hover:text-primary cursor-pointer"
                    >
                      {t(`presets.${preset.id}`) || preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reminder-client" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  {t('modal.clientLabel')} <span className="text-danger">*</span>
                </label>
                <select
                  id="reminder-client"
                  value={form.client_id}
                  onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
                  required
                  disabled={noClients}
                  className={inputClass}
                >
                  <option value="">{t('modal.selectClient')}</option>
                  {clientOptions.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="reminder-message" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  {t('modal.messageLabel')} <span className="text-danger">*</span>
                </label>
                <textarea
                  id="reminder-message"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  required
                  rows={3}
                  placeholder={t('modal.messagePlaceholder')}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label htmlFor="reminder-date" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  {t('modal.dueDateLabel')} <span className="text-danger">*</span>
                </label>
                <input
                  id="reminder-date"
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  required
                  className={inputClass}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-card-hover disabled:opacity-50 cursor-pointer"
                >
                  {t('modal.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving || noClients}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {saving ? t('modal.saving') : editingReminder ? t('modal.saveChanges') : t('modal.addSubmit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
