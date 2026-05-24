'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useBusiness } from '@/hooks/useBusiness';
import { ActionError } from '@/components/ui/action-error';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { APPOINTMENT_STATUS_OPTIONS } from '@/lib/appointments/status';
import { parseAppointment } from '@/lib/appointments/normalize';
import { StatusBadge } from '@/components/appointments/status-badge';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { formatMoney } from '@/lib/format/currency';
import type { Appointment, AppointmentStatus, Client } from '@/lib/supabase/types';
import { useTranslations, useLocale } from 'next-intl';

type AppointmentFormData = {
  client_id: string;
  date: string;
  status: AppointmentStatus;
  amount: string;
  notes: string;
};

const emptyForm: AppointmentFormData = {
  client_id: '',
  date: '',
  status: 'pending',
  amount: '',
  notes: '',
};

const inputClass =
  'w-full px-4 py-2.5 bg-input border border-input-border rounded-lg text-foreground placeholder:text-muted text-sm';

function getClientName(appointment: Appointment, t: any): string {
  const clients = appointment.clients;
  if (!clients) return t('unknownClient');
  if (Array.isArray(clients)) return clients[0]?.name ?? t('unknownClient');
  return clients.name;
}

function formatAppointmentDate(iso: string, locale: string): string {
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

function appointmentToForm(
  appointment: Appointment,
  defaultAmount: number,
): AppointmentFormData {
  const parsed = parseAppointment(appointment);
  return {
    client_id: parsed.client_id,
    date: toDatetimeLocal(parsed.date),
    status: parsed.status,
    amount: String(parsed.amount ?? defaultAmount),
    notes: parsed.notes ?? '',
  };
}

export default function AppointmentsPage() {
  const t = useTranslations('AppointmentsPage');
  const tStatus = useTranslations('Status.appointments');
  const locale = useLocale();
  const [supabase] = useState(() => createClient());
  const { businessId, business, loading: businessLoading, error: businessError } =
    useBusinessProfile(supabase);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clientOptions, setClientOptions] = useState<Pick<Client, 'id' | 'name'>[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loading = businessLoading || listLoading;
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [form, setForm] = useState<AppointmentFormData>(emptyForm);

  const fetchAppointments = useCallback(async () => {
    if (!businessId) {
      setListLoading(false);
      return;
    }

    setListLoading(true);
    setLoadError('');

    const [appointmentsResult, clientsResult] = await Promise.all([
      supabase
        .from('appointments')
        .select('*, clients(name)')
        .eq('business_id', businessId)
        .order('date', { ascending: false }),
      supabase
        .from('clients')
        .select('id, name')
        .eq('business_id', businessId)
        .order('name', { ascending: true }),
    ]);

    if (appointmentsResult.error) {
      setLoadError(appointmentsResult.error.message);
      setAppointments([]);
    } else {
      setAppointments(
        ((appointmentsResult.data as Appointment[]) ?? []).map(parseAppointment),
      );
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
    void fetchAppointments();
  }, [businessLoading, businessError, fetchAppointments]);

  const openAddModal = () => {
    setEditingAppointment(null);
    setForm({
      ...emptyForm,
      client_id: clientOptions[0]?.id ?? '',
      amount: String(business?.default_appointment_value ?? 75),
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setForm(appointmentToForm(appointment, business?.default_appointment_value ?? 75));
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingAppointment(null);
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

    if (!form.date) {
      setFormError(t('modal.errorNoDate'));
      return;
    }

    setSaving(true);
    setFormError('');

    const amountNum = form.amount ? parseFloat(form.amount) : null;
    const payload = {
      client_id: form.client_id,
      date: fromDatetimeLocal(form.date),
      status: form.status,
      amount: form.status === 'completed' ? amountNum : null,
      confirmed: form.status === 'confirmed' || form.status === 'completed',
      showed_up: form.status === 'completed',
      paid: form.status === 'completed',
      notes: form.notes.trim() || null,
    };

    if (editingAppointment) {
      const { error } = await supabase
        .from('appointments')
        .update(payload)
        .eq('id', editingAppointment.id)
        .eq('business_id', businessId);

      if (error) {
        setFormError(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from('appointments').insert({
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
    await fetchAppointments();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !businessId) return;

    setDeleting(true);
    setActionError('');

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', deleteTarget.id)
      .eq('business_id', businessId);

    setDeleting(false);

    if (error) {
      setActionError(error.message);
      return;
    }

    setDeleteTarget(null);
    await fetchAppointments();
  };

  const noClients = clientOptions.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted">
            {loading
              ? t('header.loading')
              : t('header.count', { count: appointments?.length ?? 0 })}
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
        ) : appointments.length === 0 && !loadError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
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
        ) : appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="text-start font-medium text-muted px-5 py-3.5">{t('table.clientName')}</th>
                  <th className="text-start font-medium text-muted px-5 py-3.5">{t('table.date')}</th>
                  <th className="text-start font-medium text-muted px-5 py-3.5">{t('table.status')}</th>
                  <th className="text-start font-medium text-muted px-5 py-3.5">{t('table.revenue')}</th>
                  <th className="text-end font-medium text-muted px-5 py-3.5">{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-card-hover/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground">
                      {getClientName(appointment, t)}
                    </td>
                    <td className="px-5 py-4 text-muted">{formatAppointmentDate(appointment.date, locale)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={parseAppointment(appointment).status} />
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {parseAppointment(appointment).status === 'completed'
                        ? formatMoney(
                            Number(
                              parseAppointment(appointment).amount ??
                                business?.default_appointment_value ??
                                0,
                            ),
                            business?.currency ?? 'USD',
                          )
                        : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(appointment)}
                          className="px-3 py-1.5 text-xs font-medium text-foreground bg-background border border-border rounded-lg hover:border-primary/40 hover:text-primary cursor-pointer"
                        >
                          {t('table.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(appointment)}
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
        message={deleteTarget ? t('deleteConfirm.message', { name: getClientName(deleteTarget, t), date: formatAppointmentDate(deleteTarget.date, locale) }) : ''}
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
          aria-labelledby="appointment-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
            onClick={closeModal}
            aria-label="Close modal"
          />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-5">
              <h2 id="appointment-modal-title" className="text-lg font-semibold text-foreground">
                {editingAppointment ? t('modal.editTitle') : t('modal.addTitle')}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="appointment-client" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  {t('modal.clientLabel')} <span className="text-danger">*</span>
                </label>
                <select
                  id="appointment-client"
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
                <label htmlFor="appointment-date" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  {t('modal.dateLabel')} <span className="text-danger">*</span>
                </label>
                <input
                  id="appointment-date"
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="appointment-status" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  {t('modal.statusLabel')}
                </label>
                <select
                  id="appointment-status"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value as AppointmentStatus }))
                  }
                  className={inputClass}
                >
                  {APPOINTMENT_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {tStatus(opt.value as any)}
                    </option>
                  ))}
                </select>
              </div>

              {form.status === 'completed' && (
                <div>
                  <label htmlFor="appointment-amount" className="block text-sm font-medium mb-1.5 text-foreground/80">
                    {t('modal.revenueLabel', { currency: business?.currency ?? 'USD' })}
                  </label>
                  <input
                    id="appointment-amount"
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              )}

              <div>
                <label htmlFor="appointment-notes" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  {t('modal.notesLabel')}
                </label>
                <textarea
                  id="appointment-notes"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder={t('modal.notesPlaceholder')}
                  className={`${inputClass} resize-none`}
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
                  {saving ? t('modal.saving') : editingAppointment ? t('modal.saveChanges') : t('modal.addSubmit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
