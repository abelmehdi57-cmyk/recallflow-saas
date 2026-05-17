export type ClientStatus = 'new' | 'confirmed' | 'follow-up' | 'closed' | 'ghosted';

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
