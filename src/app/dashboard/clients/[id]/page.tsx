'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { StatusBadge } from '@/components/appointments/status-badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatMoney } from '@/lib/format/currency';
import { legacyToStatus } from '@/lib/appointments/status';
import type { Appointment, AppointmentStatus, Client } from '@/lib/supabase/types';

function getClientNameFromJoin(
  clients: Appointment['clients'],
): string {
  if (!clients) return '—';
  if (Array.isArray(clients)) return clients[0]?.name ?? '—';
  return clients.name;
}

function normalizeStatus(row: Appointment): AppointmentStatus {
  if (row.status) return row.status;
  return legacyToStatus(row.confirmed ?? false, row.showed_up ?? false, row.date);
}

export default function ClientProfilePage() {
  const params = useParams();
  const clientId = params.id as string;
  const [supabase] = useState(() => createClient());
  const { businessId, business, loading: businessLoading, error: businessError } =
    useBusinessProfile(supabase);

  const [client, setClient] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    if (!businessId || !clientId) return;

    setLoading(true);
    setError('');

    const [clientRes, aptsRes] = await Promise.all([
      supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .eq('business_id', businessId)
        .maybeSingle(),
      supabase
        .from('appointments')
        .select('*, clients(name)')
        .eq('business_id', businessId)
        .eq('client_id', clientId)
        .order('date', { ascending: false }),
    ]);

    if (clientRes.error || !clientRes.data) {
      setError(clientRes.error?.message ?? 'Client not found.');
      setClient(null);
      setAppointments([]);
    } else {
      setClient(clientRes.data as Client);
      setAppointments((aptsRes.data as Appointment[]) ?? []);
    }

    setLoading(false);
  }, [supabase, businessId, clientId]);

  useEffect(() => {
    if (businessLoading) return;
    if (businessError) {
      setError(businessError);
      setLoading(false);
      return;
    }
    void fetchProfile();
  }, [businessLoading, businessError, fetchProfile]);

  const currency = business?.currency ?? 'USD';
  const revenue = appointments
    .filter((a) => normalizeStatus(a) === 'completed')
    .reduce((sum, a) => sum + Number(a.amount ?? business?.default_appointment_value ?? 0), 0);

  if (loading || businessLoading) {
    return <LoadingSpinner label="Loading client profile…" />;
  }

  if (error || !client) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/clients" className="text-sm text-primary hover:underline">
          ← Back to clients
        </Link>
        <p className="text-danger text-sm">{error || 'Client not found.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/clients" className="text-sm text-primary hover:underline">
        ← Back to clients
      </Link>

      <div className="bg-card border border-border rounded-xl p-6">
        <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <p className="text-muted">
            Phone: <span className="text-foreground">{client.phone || '—'}</span>
          </p>
          <p className="text-muted">
            Service: <span className="text-foreground">{client.service || '—'}</span>
          </p>
          <p className="text-muted">
            Status: <span className="text-foreground capitalize">{client.status}</span>
          </p>
          <p className="text-muted">
            Revenue: <span className="text-success font-semibold">{formatMoney(revenue, currency)}</span>
          </p>
        </div>
        {client.notes && (
          <p className="mt-4 text-sm text-muted border-t border-border pt-4">{client.notes}</p>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Appointment history</h2>
          <Link
            href="/dashboard/appointments"
            className="text-sm text-primary hover:text-primary-hover"
          >
            New appointment
          </Link>
        </div>
        {appointments.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No appointments yet for this client.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="text-left font-medium text-muted px-5 py-3">Date</th>
                  <th className="text-left font-medium text-muted px-5 py-3">Status</th>
                  <th className="text-left font-medium text-muted px-5 py-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map((apt) => (
                  <tr key={apt.id}>
                    <td className="px-5 py-3 text-muted">
                      {new Date(apt.date).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={normalizeStatus(apt)} />
                    </td>
                    <td className="px-5 py-3 text-foreground">
                      {normalizeStatus(apt) === 'completed'
                        ? formatMoney(
                            Number(apt.amount ?? business?.default_appointment_value ?? 0),
                            currency,
                          )
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
