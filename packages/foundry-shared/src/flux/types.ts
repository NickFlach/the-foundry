export interface FluxEntity {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  updatedAt: string;
}

export interface FluxEvent {
  entity_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}
