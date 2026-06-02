export interface User {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  is_mfa_enabled: boolean;
  subscription_tier: string;
  subscription_status: string;
  subscription_ends_at: string | null;
  created_at: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  trial_duration_days: number;
  features_json: string; // Parse to string[]
  limits_json: string;   // Parse to Record<string, number>
  is_enabled: boolean;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  plan_id: number;
  amount: number;
  currency: string;
  status: string;
  payment_gateway: string;
  gateway_payment_id?: string;
  invoice_id?: string;
  timestamp: string;
}

export interface Coupon {
  id: number;
  code: string;
  discount_percent: number;
  max_redemptions?: number;
  redemptions_count: number;
  expires_at?: string;
  is_active: boolean;
}

export interface Competitor {
  name: string;
  type: string;
  share: string;
  pitch: string;
  strengths: string;
  weaknesses: string;
  strategy: string;
}

export interface VulnerabilityCategory {
  title: string;
  desc: string;
  level: string;
  levelClass: string;
  progress: number;
  progressClass: string;
  bullets: string[];
}

export interface IdeaAnalysis {
  id: number;
  user_id: number;
  name: string | null;
  industry: string;
  target_market: string;
  pitch_text: string;
  feasibility_score: number;
  market_score: number;
  risk_score: number;
  funding_score: number;
  health_score: number;
  swot_json: string;          // Parse to { strengths: string[], weaknesses: string[] }
  competitors_json: string;   // Parse to Competitor[]
  vulnerabilities_json: string; // Parse to Record<string, VulnerabilityCategory>
  recommendation: string | null;
  timestamp: string;
}

export interface StartupEvent {
  id: number;
  title: string;
  description: string;
  event_type: string; // "hackathons", "conferences", "pitch"
  date: string;
  location: string;
  registration_link: string | null;
}

export interface TechUpdate {
  id: number;
  title: string;
  category: string;
  summary: string;
  content: string;
  source_url: string | null;
  image_name: string | null;
  date_published: string;
}

export interface ChatMessage {
  id: number;
  sender: "user" | "system";
  content: string;
  timestamp: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  ip_address?: string;
  device_info?: string;
  timestamp: string;
}

export interface AdminSummaryMetrics {
  total_users: number;
  active_users: number;
  total_revenue: number;
  total_analyses: number;
  total_registrations: number;
  recent_transactions: Transaction[];
}
