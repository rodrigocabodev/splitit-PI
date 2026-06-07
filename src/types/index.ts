// Tipos que reflejan exactamente las tablas de la base de datos en Supabase

export type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  wallet_balance: number;
  avatar_url: string | null;
  created_at: string;
};

export type Service = {
  id: number;
  title: string;
  description: string | null;
  price_per_hour: number;
  category: string;
  is_active: boolean;
  image_url: string | null;
  rating: number;
  opens_at: string;
  closes_at: string;
  created_at: string;
};

export type Booking = {
  id: number;
  organizer_id: string;
  service_id: number;
  start_time: string;
  end_time: string;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled" | "finished";
  created_at: string;
};

export type Participant = {
  id: number;
  booking_id: number;
  user_id: string | null;
  guest_email: string | null;
  amount_owed: number;
  payment_status: "pending" | "paid" | "failed";
  created_at: string;
};

export type TrustedContact = {
  id: number;
  user_id: string;
  contact_id: string;
  auto_pay_enabled: boolean;
  created_at: string;
};

export type WalletTransaction = {
  id: number;
  user_id: string;
  amount: number;
  type: "deposit" | "payment" | "withdrawal" | "refund";
  created_at: string;
};
