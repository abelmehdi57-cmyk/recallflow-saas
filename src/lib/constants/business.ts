export const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'MAD', label: 'MAD (DH)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
] as const;

export const BUSINESS_TYPES = [
  { value: 'salon', label: 'Salon / Spa' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'clinic', label: 'Clinic / Health' },
  { value: 'fitness', label: 'Fitness / Coaching' },
  { value: 'retail', label: 'Retail / Shop' },
  { value: 'professional', label: 'Professional Services' },
  { value: 'general', label: 'Other' },
] as const;

export const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern (US)' },
  { value: 'America/Chicago', label: 'Central (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific (US)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Africa/Casablanca', label: 'Casablanca' },
  { value: 'Asia/Dubai', label: 'Dubai' },
] as const;
