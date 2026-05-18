'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Client, Reminder } from '@/lib/supabase/types';

const PENDING_BADGE = 'bg-warning-light text-warning border-warning/25';
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

function getClientName(reminder: Reminder): string {
  const clients = reminder.clients;
  if (!clients) return 'Unknown client';
  if (Array.isArray(clients)) return clients[0]?.name ?? 'Unknown client';
  return clients.name;
}

function formatDueDate(iso: string): string {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timePart = d.toLocaleTimeString('en-US', {
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
  const [supabase] = useState(() => createClient());

  const [businessId, setBusinessId] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [clientOptions, setClientOptions] = useState<Pick<Client, 'id' | 'name'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [markingDoneId, setMarkingDoneId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [form, setForm] = useState<ReminderFormData>(emptyForm);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setLoadError('You must be signed in to view reminders.');
      return;
    }

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (businessError || !business) {
      setBusinessId(null);
      setReminders([]);
      setClientOptions([]);
      setLoading(false);
      setLoadError('No business profile found. Complete setup from the dashboard first.');
      return;
    }

    setBusinessId(business.id);

    const [remindersResult, clientsResult] = await Promise.all([
      supabase
        .from('reminders')
        .select('*, clients(name)')
        .eq('business_id', business.id)
        .order('done', { ascending: true })
        .order('date', { ascending: true }),
      supabase
        .from('clients')
        .select('id, name')
        .eq('business_id', business.id)
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

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

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
      setFormError('Please select a client.');
      return;
    }

    const message = form.message.trim();
    if (!message) {
      setFormError('Message is required.');
      return;
    }

    if (!form.date) {
      setFormError('Due date and time are required.');
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
      window.alert(error.message);
      return;
    }

    await fetchReminders();
  };

  const handleDelete = async (reminder: Reminder) => {
    const confirmed = window.confirm(
      `Delete reminder for ${getClientName(reminder)}? This cannot be undone.`,
    );
    if (!confirmed || !businessId) return;

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminder.id)
      .eq('business_id', businessId);

    if (error) {
      window.alert(error.message);
      return;
    }

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
              ? 'Loading reminders…'
              : `${reminders.length} reminder${reminders.length === 1 ? '' : 's'} · ${pendingCount} pending`}
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
          Add Reminder
        </button>
      </div>

      {noClients && !loading && businessId && (
        <div className="bg-warning-light border border-warning/25 text-warning rounded-lg p-4 text-sm">
          Add at least one client before creating reminders.{' '}
          <a href="/dashboard/clients" className="underline font-medium hover:text-foreground">
            Go to Clients
          </a>
        </div>
      )}

      {loadError && (
        <div className="bg-danger-light border border-danger/20 text-danger rounded-lg p-4 text-sm">
          {loadError}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
            <p className="text-sm text-muted">Loading reminders…</p>
          </div>
        ) : reminders.length === 0 && !loadError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">No reminders yet</h2>
            <p className="text-muted text-sm max-w-sm mb-6">
              Create follow-up reminders so you never miss a check-in with your clients.
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
              Add your first reminder
            </button>
          </div>
        ) : reminders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="text-left font-medium text-muted px-5 py-3.5">Client Name</th>
                  <th className="text-left font-medium text-muted px-5 py-3.5">Message</th>
                  <th className="text-left font-medium text-muted px-5 py-3.5">Due Date</th>
                  <th className="text-left font-medium text-muted px-5 py-3.5">Status</th>
                  <th className="text-right font-medium text-muted px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reminders.map((reminder) => (
                  <tr
                    key={reminder.id}
                    className={`hover:bg-card-hover/50 transition-colors ${reminder.done ? 'opacity-70' : ''}`}
                  >
                    <td className="px-5 py-4 font-medium text-foreground">
                      {getClientName(reminder)}
                    </td>
                    <td className="px-5 py-4 text-muted max-w-xs truncate">{reminder.message}</td>
                    <td className="px-5 py-4 text-muted whitespace-nowrap">
                      {formatDueDate(reminder.date)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          reminder.done ? DONE_BADGE : PENDING_BADGE
                        }`}
                      >
                        {reminder.done ? 'Done' : 'Pending'}
                      </span>
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
                            {markingDoneId === reminder.id ? 'Saving…' : 'Mark as Done'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditModal(reminder)}
                          className="px-3 py-1.5 text-xs font-medium text-foreground bg-background border border-border rounded-lg hover:border-primary/40 hover:text-primary cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(reminder)}
                          className="px-3 py-1.5 text-xs font-medium text-danger bg-danger-light border border-danger/20 rounded-lg hover:bg-danger/20 cursor-pointer"
                        >
                          Delete
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
                {editingReminder ? 'Edit Reminder' : 'Add Reminder'}
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
                <label htmlFor="reminder-client" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  Client <span className="text-danger">*</span>
                </label>
                <select
                  id="reminder-client"
                  value={form.client_id}
                  onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
                  required
                  disabled={noClients}
                  className={inputClass}
                >
                  <option value="">Select a client</option>
                  {clientOptions.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="reminder-message" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  Message <span className="text-danger">*</span>
                </label>
                <textarea
                  id="reminder-message"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  required
                  rows={3}
                  placeholder="Follow up about their last visit…"
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label htmlFor="reminder-date" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  Due Date <span className="text-danger">*</span>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || noClients}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving…' : editingReminder ? 'Save changes' : 'Add reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>

)}
    </div>
  );
}
