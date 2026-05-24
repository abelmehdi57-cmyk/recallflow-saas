'use client';

import type { ClientStatus } from '@/lib/supabase/types';
import { useTranslations } from 'next-intl';

export type ClientSort = 'name-asc' | 'name-desc' | 'newest' | 'oldest';

type ClientListToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: ClientStatus | 'all';
  onStatusFilterChange: (value: ClientStatus | 'all') => void;
  sort: ClientSort;
  onSortChange: (value: ClientSort) => void;
};

const inputClass =
  'w-full px-3 py-2 bg-input border border-input-border rounded-lg text-foreground text-sm';

export function ClientListToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sort,
  onSortChange,
}: ClientListToolbarProps) {
  const t = useTranslations('ClientsPage.toolbar');
  const tStatus = useTranslations('Status.clients');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="sm:col-span-2">
        <label htmlFor="client-search" className="sr-only">
          {t('searchLabel')}
        </label>
        <input
          id="client-search"
          type="search"
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={inputClass}
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value as ClientStatus | 'all')}
        className={inputClass}
        aria-label="Filter by status"
      >
        <option value="all">{t('allStatuses')}</option>
        <option value="new">{tStatus('new')}</option>
        <option value="confirmed">{tStatus('confirmed')}</option>
        <option value="follow-up">{tStatus('follow-up')}</option>
        <option value="closed">{tStatus('closed')}</option>
        <option value="ghosted">{tStatus('ghosted')}</option>
      </select>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as ClientSort)}
        className={inputClass}
        aria-label="Sort clients"
      >
        <option value="name-asc">{t('sortNameAsc')}</option>
        <option value="name-desc">{t('sortNameDesc')}</option>
        <option value="newest">{t('sortNewest')}</option>
        <option value="oldest">{t('sortOldest')}</option>
      </select>
    </div>
  );
}

export function filterAndSortClients<T extends {
  name: string;
  phone: string | null;
  service: string | null;
  status: ClientStatus;
  created_at: string;
}>(clients: T[], search: string, statusFilter: ClientStatus | 'all', sort: ClientSort): T[] {
  const q = search.trim().toLowerCase();
  let list = clients.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone?.toLowerCase().includes(q) ?? false) ||
      (c.service?.toLowerCase().includes(q) ?? false)
    );
  });

  list = [...list].sort((a, b) => {
    switch (sort) {
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return list;
}