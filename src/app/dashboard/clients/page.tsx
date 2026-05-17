'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Client, ClientStatus } from '@/lib/supabase/types';

const STATUS_OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'closed', label: 'Closed' },
  { value: 'ghosted', label: 'Ghosted' },
];

const STATUS_BADGE: Record<ClientStatus, string> = {
  new: 'bg-primary/15 text-primary border-primary/25',
  confirmed: 'bg-success-light text-success border-success/25',
  'follow-up': 'bg-warning-light text-warning border-warning/25',
  closed: 'bg-foreground/10 text-muted border-border',
  ghosted: 'bg-danger-light text-danger border-danger/25',
};

type ClientFormData = {
  name: string;
  phone: string;
  service: string;
  status: ClientStatus;
  notes: string;
};

const emptyForm: ClientFormData = {
  name: '',
  phone: '',
  service: '',
  status: 'new',
  notes: '',
};

function formatStatusLabel(status: ClientStatus): string {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

function formatLastContact(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function clientToForm(client: Client): ClientFormData {
  return {
    name: client.name,
    phone: client.phone ?? '',
    service: client.service ?? '',
    status: client.status,
    notes: client.notes ?? '',
  };
}

const inputClass =
  'w-full px-4 py-2.5 bg-input border border-input-border rounded-lg text-foreground placeholder:text-muted text-sm';

export default function ClientsPage() {
  const [supabase] = useState(() => createClient());

  const [businessId, setBusinessId] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormData>(emptyForm);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setLoadError('You must be signed in to view clients.');
      return;
    }

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (businessError || !business) {
      setBusinessId(null);
      setClients([]);
      setLoading(false);
      setLoadError('No business profile found. Complete setup from the dashboard first.');
      return;
    }

    setBusinessId(business.id);

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });

    if (error) {
      setLoadError(error.message);
      setClients([]);
    } else {
      setClients((data as Client[]) ?? []);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const openAddModal = () => {
    setEditingClient(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setForm(clientToForm(client));
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingClient(null);
    setForm(emptyForm);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    const name = form.name.trim();
    if (!name) {
      setFormError('Name is required.');
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      name,
      phone: form.phone.trim() || null,
      service: form.service.trim() || null,
      status: form.status,
      notes: form.notes.trim() || null,
    };

    if (editingClient) {
      const { error } = await supabase
        .from('clients')
        .update(payload)
        .eq('id', editingClient.id)
        .eq('business_id', businessId);

      if (error) {
        setFormError(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from('clients').insert({
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
    await fetchClients();
  };

  const handleDelete = async (client: Client) => {
    const confirmed = window.confirm(
      `Delete ${client.name}? This cannot be undone.`,
    );
    if (!confirmed || !businessId) return;

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', client.id)
      .eq('business_id', businessId);

    if (error) {
      window.alert(error.message);
      return;
    }

    await fetchClients();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted">
            {loading
              ? 'Loading clients…'
              : `${clients.length} client${clients.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          disabled={loading || !businessId}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Client
        </button>
      </div>

      {loadError && (
        <div className="bg-danger-light border border-danger/20 text-danger rounded-lg p-4 text-sm">
          {loadError}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
            <p className="text-sm text-muted">Loading clients…</p>
          </div>
        ) : clients.length === 0 && !loadError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">No clients yet</h2>
            <p className="text-muted text-sm max-w-sm mb-6">
              Add your first client to start tracking appointments, follow-ups, and contact history.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              disabled={!businessId}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add your first client
            </button>
          </div>
        ) : clients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="text-left font-medium text-muted px-5 py-3.5">Name</th>
                  <th className="text-left font-medium text-muted px-5 py-3.5">Phone</th>
                  <th className="text-left font-medium text-muted px-5 py-3.5">Service</th>
                  <th className="text-left font-medium text-muted px-5 py-3.5">Status</th>
                  <th className="text-left font-medium text-muted px-5 py-3.5">Last Contact</th>
                  <th className="text-right font-medium text-muted px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-card-hover/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground">{client.name}</td>
                    <td className="px-5 py-4 text-muted">{client.phone || '—'}</td>
                    <td className="px-5 py-4 text-muted">{client.service || '—'}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_BADGE[client.status]}`}
                      >
                        {formatStatusLabel(client.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted">{formatLastContact(client.last_contact)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(client)}
                          className="px-3 py-1.5 text-xs font-medium text-foreground bg-background border border-border rounded-lg hover:border-primary/40 hover:text-primary cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(client)}
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
          aria-labelledby="client-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
            onClick={closeModal}
            aria-label="Close modal"
          />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 z-10">
            <div className="flex items-start justify-between mb-5">
              <h2 id="client-modal-title" className="text-lg font-semibold text-foreground">
                {editingClient ? 'Edit Client' : 'Add Client'}
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
                <label htmlFor="client-name" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  Name <span className="text-danger">*</span>
                </label>
                <input
                  id="client-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Jane Smith"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="client-phone" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  Phone
                </label>
                <input
                  id="client-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 555 0100"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="client-service" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  Service
                </label>
                <input
                  id="client-service"
                  type="text"
                  value={form.service}
                  onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                  placeholder="Haircut, dinner reservation…"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="client-status" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  Status
                </label>
                <select
                  id="client-status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ClientStatus }))}
                  className={inputClass}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="client-notes" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  Notes
                </label>
                <textarea
                  id="client-notes"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder="Preferences, allergies, special requests…"
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
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving…' : editingClient ? 'Save changes' : 'Add client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
