import re

def update_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

update_file("/Users/mac/Documents/first saas /recallflow/src/components/clients/client-list-toolbar.tsx", [
    ("import type { ClientStatus } from '@/lib/supabase/types';", "import type { ClientStatus } from '@/lib/supabase/types';\nimport { useTranslations } from 'next-intl';"),
    ("export function ClientListToolbar({", "export function ClientListToolbar({\n  search,\n  onSearchChange,\n  statusFilter,\n  onStatusFilterChange,\n  sort,\n  onSortChange,\n}: ClientListToolbarProps) {\n  const t = useTranslations('ClientsPage.toolbar');\n  const tStatus = useTranslations('Status.clients');"),
    ("  search,\n  onSearchChange,\n  statusFilter,\n  onStatusFilterChange,\n  sort,\n  onSortChange,\n}: ClientListToolbarProps) {", ""),
    ("Search clients", "{t('searchLabel')}"),
    ("placeholder=\"Search by name, phone, or service…\"", "placeholder={t('searchPlaceholder')}"),
    ("{STATUS_FILTER_OPTIONS.map((o) => (", "{STATUS_FILTER_OPTIONS.map((o) => (\n          <option key={o.value} value={o.value}>\n            {o.value === 'all' ? t('allStatuses') : tStatus(o.value as any)}\n          </option>\n        ))}"),
    ("          <option key={o.value} value={o.value}>\n            {o.label}\n          </option>\n        ))}", ""),
    ("<option value=\"name-asc\">Name A–Z</option>", "<option value=\"name-asc\">{t('sortNameAsc')}</option>"),
    ("<option value=\"name-desc\">Name Z–A</option>", "<option value=\"name-desc\">{t('sortNameDesc')}</option>"),
    ("<option value=\"newest\">Newest first</option>", "<option value=\"newest\">{t('sortNewest')}</option>"),
    ("<option value=\"oldest\">Oldest first</option>", "<option value=\"oldest\">{t('sortOldest')}</option>")
])

print("Done toolbar")
