import type { WeeklyPoint } from '@/lib/dashboard/analytics';
import { useTranslations } from 'next-intl';

type WeeklyTrendChartProps = {
  data: WeeklyPoint[];
  title?: string;
};

export function WeeklyTrendChart({ data, title }: WeeklyTrendChartProps) {
  const t = useTranslations('DashboardWidgets.WeeklyTrendChart');
  const finalTitle = title ?? t('title');
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="text-lg font-semibold text-foreground mb-4">{finalTitle}</h2>
      <div className="flex items-end justify-between gap-2 h-36">
        {data.map((point) => (
          <div key={point.dateKey} className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <span className="text-xs font-medium text-foreground">{point.count}</span>
            <div
              className="w-full max-w-[40px] rounded-t-md bg-primary/80 hover:bg-primary transition-colors min-h-1"
              style={{ height: `${Math.max((point.count / max) * 100, point.count > 0 ? 12 : 4)}%` }}
              title={`${point.label}: ${point.count}`}
            />
            <span className="text-[10px] sm:text-xs text-muted truncate w-full text-center">
              {point.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
