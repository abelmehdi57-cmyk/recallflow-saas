import Link from 'next/link';
import { formatMoney } from '@/lib/format/currency';
import { useTranslations } from 'next-intl';

type LostRevenueWidgetProps = {
  amount: number;
  noShowCount: number;
  currency: string;
};

export function LostRevenueWidget({ amount, noShowCount, currency }: LostRevenueWidgetProps) {
  const t = useTranslations('DashboardWidgets.LostRevenueWidget');
  return (
    <div className="bg-card border border-danger/30 rounded-xl p-5 relative overflow-hidden">
      <div className="absolute top-0 end-0 w-32 h-32 bg-danger/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 rtl:-translate-x-1/2" />
      <div className="relative">
        <p className="text-sm text-muted mb-1">{t('title')}</p>
        <p className="text-3xl font-bold text-danger">{formatMoney(amount, currency)}</p>
        <p className="text-xs text-muted mt-2">
          {t('subtitle', { count: noShowCount })}
        </p>
        <Link
          href="/dashboard/appointments"
          className="inline-block mt-4 text-sm text-primary hover:text-primary-hover font-medium"
        >
          {t('link')}
        </Link>
      </div>
    </div>
  );
}
