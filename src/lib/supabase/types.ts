export type ClientStatus = 'new' | 'confirmed' | 'follow-up' | 'closed' | 'ghosted';

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

export type Business = {
  id: string;
  owner_id: string;
  business_name: string;
  plan: string;
  created_at: string;
};

export type ReminderWithClient = {
  id: string;
  message: string;
  date: string;
  clients: { name: string } | { name: string }[] | null;
};

export type Appointment = {
  id: string;
  business_id: string;
  client_id: string;
  date: string;
  confirmed: boolean;
  showed_up: boolean;
  paid: boolean;
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
