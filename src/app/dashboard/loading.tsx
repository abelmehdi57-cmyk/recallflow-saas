import { getTranslations } from 'next-intl/server';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default async function DashboardLoading() {
  const t = await getTranslations('DashboardLoading');
  return <LoadingSpinner label={t('label')} />;
}
