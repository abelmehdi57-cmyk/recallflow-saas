import re

def update_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)


# LoadingSpinner
update_file("/Users/mac/Documents/first saas /recallflow/src/components/ui/loading-spinner.tsx", [
    ("export function LoadingSpinner({", "import { useTranslations } from 'next-intl';\n\nexport function LoadingSpinner({"),
    ("label = 'Loading…',", "label,"),
    ("}: LoadingSpinnerProps) {", "}: LoadingSpinnerProps) {\n  const t = useTranslations('Components.LoadingSpinner');\n  const finalLabel = label ?? t('loading');"),
    ("{label}", "{finalLabel}")
])

# ActionError
update_file("/Users/mac/Documents/first saas /recallflow/src/components/ui/action-error.tsx", [
    ("export function ActionError({ message, onDismiss }: ActionErrorProps) {", "import { useTranslations } from 'next-intl';\n\nexport function ActionError({ message, onDismiss }: ActionErrorProps) {\n  const t = useTranslations('Components.ActionError');"),
    ("aria-label=\"Dismiss error\"", "aria-label={t('dismiss')}")
])

# EmptyState
update_file("/Users/mac/Documents/first saas /recallflow/src/components/ui/empty-state.tsx", [
    ("export function EmptyState({ icon, title, description, actionLabel, actionHref, onAction, actionDisabled }: EmptyStateProps) {", "export function EmptyState({ icon, title, description, actionLabel, actionHref, onAction, actionDisabled }: EmptyStateProps) {")
])

print("Done")
