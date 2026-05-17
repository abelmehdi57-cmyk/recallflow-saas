'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Appointment, Client } from '@/lib/supabase/types';

const YES_BADGE = 'bg-success-light text-success border-success/25';
const NO_BADGE = 'bg-foreground/10 text-muted border-border';

type AppointmentFormData = {
  client_id: string;
  date: string;
  confirmed: boolean;
  showed_up: boolean;
  paid: boolean;
  notes: string;
};

const emptyForm: AppointmentFormData = {
  client_id: '',
  date: '',
  confirmed: false,
  showed_up: false,
  paid: false,
  notes: '',
};

const inputClass =
  'w-full px-4 py-2.5 bg-input border border-input-border rounded-lg text-foreground placeholder:text-muted text-sm';

function getClientName(appointment: Appointment): string {
  const clients = appointment.clients;
  if (!clients) return 'Unknown client';
  if (Array.isArray(clients)) return clients[0]?.name ?? 'Unknown client';
  return clients.name;
}

function formatAppointmentDate(iso: string): string {
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

function appointmentToForm(appointment: Appointment): AppointmentFormData {
  return {
    client_id: appointment.client_id,
    date: toDatetimeLocal(appointment.date),
    confirmed: appointment.confirmed,
    showed_up: appointment.showed_up,
    paid: appointment.paid,
    notes: appointment.notes ?? '',
  };
}

function BoolBadge({ value }: { value: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        value ? YES_BADGE : NO_BADGE
      }`}
    >
      {value ? 'Yes' : 'No'}
    </span>
  );
}

export default function AppointmentsPage() {
  const [supabase] = useState(() => createClient());

  const [businessId, setBusinessId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clientOptions, setClientOptions] = useState<Pick<Client, 'id' | 'name'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [form, setForm] = useState<AppointmentFormData>(emptyForm);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setLoadError('You must be signed in to view appointments.');
      return;
    }

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (businessError || !business) {
      setBusinessId(null);
      setAppointments([]);
      setClientOptions([]);
      setLoading(false);
      setLoadError('No business profile found. Complete setup from the dashboard first.');
      return;
    }

    setBusinessId(business.id);

    const [appointmentsResult, clientsResult] = await Promise.all([
      supabase
        .from('appointments')
        .select('*, clients(name)')
        .eq('business_id', business.id)
        .order('date', { ascending: false }),
      supabase
        .from('clients')
        .select('id, name')
        .eq('business_id', business.id)
        .order('name', { ascending: true }),
    ]);

    if (appointmentsResult.error) {
      setLoadError(appointmentsResult.error.message);
      setAppointments([]);
    } else {
      setAppointments((appointmentsResult.data as Appointment[]) ?? []);
    }

    if (!clientsResult.error) {
      setClientOptions((clientsResult.data as Pick<Client, 'id' | 'name'>[]) ?? []);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const openAddModal = () => {
    setEditingAppointment(null);
    setForm({
      ...emptyForm,
      client_id: clientOptions[0]?.id ?? '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setForm(appointmentToForm(appointment));
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
      setFormError('Please select a client.');
      return;
    }

    if (!form.date) {
      setFormError('Date and time are required.');
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      client_id: form.client_id,
      date: fromDatetimeLocal(form.date),
      confirmed: form.confirmed,
      showed_up: form.showed_up,
      paid: form.paid,
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

  const handleDelete = async (appointment: Appointment) => {
    const clientName = getClientName(appointment);
    const confirmed = window.confirm(
      `Delete appointment for ${clientName} on ${formatAppointmentDate(appointment.date)}? This cannot be undone.`,
    );
    if (!confirmed || !businessId) return;

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointment.id)
      .eq('business_id', businessId);

    if (error) {
      window.alert(error.message);
      return;
    }

    await fetchAppointments();
  };

  const noClients = clientOptions.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted">
            {loading
              ? 'Loading appointments…'
              : `${appointments.length} appointment${appointments.length === 1 ? '' : 's'}`}
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
          Add Appointment
        </button>
      </div>

      {noClients && !loading && businessId && (
        <div className="bg-warning-light border border-warning/25 text-warning rounded-lg p-4 text-sm">
          Add at least one client before scheduling appointments.{' '}
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
            <p className="text-sm text-muted">Loading appointments…</p>
          </div>
        ) : appointments.length === 0 && !loadError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">No appointments yet</h2>
            <p className="text-muted text-sm max-w-sm mb-6">
              Schedule your first appointment to track confirmations, attendance, and payments.
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
              Add your first appointment
            </button>
          </div>
        ) : appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="text-left font-medium text-muted px-5 py-3.5">Client Name</th>
                  <th className="text-left font-medium text-muted px-5 py-3.5">Date</th>
                  <th className="text-left font-medium text-muted px-5 py-3.5">Confirmed</th>
                  <th className="text-left font-medium text-muted px-5 py-3.5">Showed Up</th>
                  <th className="text-left font-medium text-muted px-5 py-3.5">Paid</th>
                  <th className="text-right font-medium text-muted px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-card-hover/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground">
                      {getClientName(appointment)}
                    </td>
                    <td className="px-5 py-4 text-muted">{formatAppointmentDate(appointment.date)}</td>
                    <td className="px-5 py-4">
                      <BoolBadge value={appointment.confirmed} />
                    </td>
                    <td className="px-5 py-4">
                      <BoolBadge value={appointment.showed_up} />
                    </td>
                    <td className="px-5 py-4">
                      <BoolBadge value={appointment.paid} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(appointment)}
                          className="px-3 py-1.5 text-xs font-medium text-foreground bg-background border border-border rounded-lg hover:border-primary/40 hover:text-primary cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(appointment)}
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
                {editingAppointment ? 'Edit Appointment' : 'Add Appointment'}
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
                  Client <span className="text-danger">*</span>
                </label>
                <select
                  id="appointment-client"
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
                <label htmlFor="appointment-date" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  Date <span className="text-danger">*</span>
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

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground/80">Status</p>
                {(
                  [
                    { key: 'confirmed' as const, label: 'Confirmed' },
                    { key: 'showed_up' as const, label: 'Showed Up' },
                    { key: 'paid' as const, label: 'Paid' },
                  ] as const
                ).map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background cursor-pointer hover:border-primary/30"
                  >
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                      className="w-4 h-4 rounded border-input-border text-primary focus:ring-primary focus:ring-offset-0 bg-input"
                    />
                    <span className="text-sm text-foreground">{label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label htmlFor="appointment-notes" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  Notes
                </label>
                <textarea
                  id="appointment-notes"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder="Special requests, room preference…"
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || noClients}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving…' : editingAppointment ? 'Save changes' : 'Add appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
  
}
