/**
 * Wasteland types matching the wl-commons DoltHub schema (hop/wl-commons).
 * READ-ONLY integration — these are query result shapes.
 */

export interface WantedItem {
  id: string;
  title: string;
  description: string;
  project: string;
  type: string;
  priority: string;
  tags: string[];
  posted_by: string;
  claimed_by: string | null;
  status: string;
  effort_level: string;
  evidence_url: string | null;
  sandbox_required: boolean;
  sandbox_scope: string | null;
  sandbox_min_tier: string | null;
  created_at: string;
  updated_at: string;
}

export interface Completion {
  id: string;
  wanted_id: string;
  completed_by: string;
  evidence_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Stamp {
  id: string;
  rig_id: string;
  stamp_type: string;
  reason: string;
  granted_by: string;
  created_at: string;
}

export interface Rig {
  id: string;
  name: string;
  type: string;
  status: string;
  joined_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface WastelandStats {
  total_wanted: number;
  open_wanted: number;
  claimed_wanted: number;
  completed_count: number;
  rig_count: number;
}

export interface WantedFilters {
  project?: string;
  status?: string;
  type?: string;
  priority?: string;
}
