export type ClientStatus = 'new' | 'confirmed' | 'follow-up' | 'closed' | 'ghosted';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export type BusinessType =
  | 'salon'
  | 'restaurant'
  | 'clinic'
  | 'fitness'
  | 'retail'
  | 'professional'
  | 'general';

export type BusinessLanguage = 'en' | 'fr' | 'ar';

export type Business = {
  id: string;
  owner_id: string;
  business_name: string;
  plan: string;
  currency: string;
  language: BusinessLanguage;
  timezone: string;
  business_type: BusinessType | string;
  default_appointment_value: number;
  created_at: string;
};

export type BusinessProfile = Pick<
  Business,
  | 'id'
  | 'business_name'
  | 'currency'
  | 'language'
  | 'timezone'
  | 'business_type'
  | 'default_appointment_value'
>;

export type Client = {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  service: string | null;
  status: ClientStatus;
  notes: string | null;
  last_contact: string | null;
  created_at: string;
};

export type ReminderWithClient = {
  id: string;
  message: string;
  date: string;
  done?: boolean;
  clients: { name: string } | { name: string }[] | null;
};

export type Appointment = {
  id: string;
  business_id: string;
  client_id: string;
  date: string;
  status: AppointmentStatus;
  amount: number | null;
  /** @deprecated use status */
  confirmed?: boolean;
  /** @deprecated use status */
  showed_up?: boolean;
  /** @deprecated use status */
  paid?: boolean;
  notes: string | null;
  created_at: string;
  clients: { name: string } | { name: string }[] | null;
};

export type Reminder = {
  id: string;
  business_id: string;
  client_id: string;
  date: string;
  message: string;
  done: boolean;
  created_at: string;
  clients: { name: string } | { name: string }[] | null;
};
