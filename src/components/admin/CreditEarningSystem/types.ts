export interface CreditRule {
  id: string;
  rule_name: string;
  rule_description: string;
  credit_amount: number;
  daily_limit: number | null;
  cooldown_hours: number | null;
  max_per_target: number | null;
  is_enabled: boolean;
  requires_verification: boolean;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditAuditEntry {
  id: string;
  rule_id: string;
  admin_id: string;
  action_type: string;
  before_values: any;
  after_values: any;
  notes: string | null;
  created_at: string;
}

export interface CreditRuleFormData {
  credit_amount: number;
  daily_limit: number | null;
  cooldown_hours: number | null;
  max_per_target: number | null;
  is_enabled: boolean;
  internal_notes: string;
}