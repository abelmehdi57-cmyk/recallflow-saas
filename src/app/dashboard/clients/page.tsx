'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  ClientListToolbar,
  filterAndSortClients,
  type ClientSort,
} from '@/components/clients/client-list-toolbar';
import { useBusiness } from '@/hooks/useBusiness';
import { ActionError } from '@/components/ui/action-error';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { Client, ClientStatus } from '@/lib/supabase/types';
import { useTranslations, useLocale } from 'next-intl';

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

function formatLastContact(iso: string | null, locale: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(locale, {
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
  const t = useTranslations('ClientsPage');
  const tStatus = useTranslations('Status.clients');
  const locale = useLocale();

  const [supabase] = useState(() => createClient());
  const { businessId, loading: businessLoading, error: businessError } = useBusiness(supabase);

  const [clients, setClients] = useState<Client[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loading = businessLoading || listLoading;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');
  const [sort, setSort] = useState<ClientSort>('name-asc');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormData>(emptyForm);

  const displayedClients = useMemo(
    () => filterAndSortClients(clients, search, statusFilter, sort),
    [clients, search, statusFilter, sort],
  );

  const fetchClients = useCallback(async () => {
    if (!businessId) {
      setListLoading(false);
      setClients([]);
      return;
    }

    setListLoading(true);
    setLoadError('');

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      setLoadError(error.message);
      setClients([]);
    } else {
      setClients((data as Client[]) ?? []);
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
    void fetchClients();
  }, [businessLoading, businessError, fetchClients]);

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
      setFormError(t('modal.errorNoName'));
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

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !businessId) return;

    setDeleting(true);
    setActionError('');

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', deleteTarget.id)
      .eq('business_id', businessId);

    setDeleting(false);

    if (error) {
      setActionError(error.message);
      return;
    }

    setDeleteTarget(null);
    await fetchClients();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted">
            {loading
              ? t('header.loading')
              : t('header.count', { count: clients?.length ?? 0 })}
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
          {t('header.addButton')}
        </button>
      </div>

      <ActionError message={actionError} onDismiss={() => setActionError('')} />

      {loadError && (
        <div className="bg-danger-light border border-danger/20 text-danger rounded-lg p-4 text-sm">
          {loadError}
        </div>
      )}

      {!loading && clients.length > 0 && (
        <ClientListToolbar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sort={sort}
          onSortChange={setSort}
        />
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <LoadingSpinner label={t('header.loading')} />
        ) : clients.length === 0 && !loadError ? (
          <EmptyState
            icon={
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            }
            title={t('empty.title')}
            description={t('empty.subtitle')}
            actionLabel={t('empty.addButton')}
            onAction={openAddModal}
            actionDisabled={!businessId}
          />
        ) : displayedClients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="text-start font-medium text-muted px-5 py-3.5">{t('table.name')}</th>
                  <th className="text-start font-medium text-muted px-5 py-3.5">{t('table.phone')}</th>
                  <th className="text-start font-medium text-muted px-5 py-3.5">{t('table.service')}</th>
                  <th className="text-start font-medium text-muted px-5 py-3.5">{t('table.status')}</th>
                  <th className="text-start font-medium text-muted px-5 py-3.5">{t('table.lastContact')}</th>
                  <th className="text-end font-medium text-muted px-5 py-3.5">{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-card-hover/50 transition-colors">
                    <td className="px-5 py-4 font-medium">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="text-foreground hover:text-primary"
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-muted" dir="ltr">{client.phone || '—'}</td>
                    <td className="px-5 py-4 text-muted">{client.service || '—'}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_BADGE[client.status]}`}
                      >
                        {tStatus(client.status as any)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted">{formatLastContact(client.last_contact, locale)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="px-3 py-1.5 text-xs font-medium text-foreground bg-background border border-border rounded-lg hover:border-primary/40 hover:text-primary"
                        >
                          {t('table.view')}
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditModal(client)}
                          className="px-3 py-1.5 text-xs font-medium text-foreground bg-background border border-border rounded-lg hover:border-primary/40 hover:text-primary cursor-pointer"
                        >
                          {t('table.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(client)}
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
        message={deleteTarget ? t('deleteConfirm.message', { name: deleteTarget.name }) : ''}
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
          aria-labelledby="client-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
            onClick={closeModal}
            aria-label="Close modal"
          />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-5">
              <h2 id="client-modal-title" className="text-lg font-semibold text-foreground">
                {editingClient ? t('modal.editTitle') : t('modal.addTitle')}
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
                  {t('modal.nameLabel')} <span className="text-danger">*</span>
                </label>
                <input
                  id="client-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder={t('modal.namePlaceholder')}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="client-phone" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  {t('modal.phoneLabel')}
                </label>
                <input
                  id="client-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder={t('modal.phonePlaceholder')}
                  className={inputClass}
                  dir="ltr"
                />
              </div>

              <div>
                <label htmlFor="client-service" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  {t('modal.serviceLabel')}
                </label>
                <input
                  id="client-service"
                  type="text"
                  value={form.service}
                  onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                  placeholder={t('modal.servicePlaceholder')}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="client-status" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  {t('modal.statusLabel')}
                </label>
                <select
                  id="client-status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ClientStatus }))}
                  className={inputClass}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {tStatus(opt.value as any)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="client-notes" className="block text-sm font-medium mb-1.5 text-foreground/80">
                  {t('modal.notesLabel')}
                </label>
                <textarea
                  id="client-notes"
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
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {saving ? t('modal.saving') : editingClient ? t('modal.saveChanges') : t('modal.addSubmit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
