import type { FluxEntity, FluxEvent } from "./types.js";

export class FluxClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = (baseUrl ?? process.env.FLUX_URL ?? "https://flux.eckman-tech.com").replace(/\/$/, "");
  }

  async getEntity(id: string): Promise<FluxEntity> {
    const res = await fetch(`${this.baseUrl}/entities/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`Flux error: ${res.status} ${res.statusText}`);
    return res.json() as Promise<FluxEntity>;
  }

  async listEntities(type?: string): Promise<FluxEntity[]> {
    const params = type ? `?type=${encodeURIComponent(type)}` : "";
    const res = await fetch(`${this.baseUrl}/entities${params}`);
    if (!res.ok) throw new Error(`Flux error: ${res.status} ${res.statusText}`);
    return res.json() as Promise<FluxEntity[]>;
  }

  async publishEvent(event: FluxEvent): Promise<void> {
    const res = await fetch(`${this.baseUrl}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    if (!res.ok) throw new Error(`Flux error: ${res.status} ${res.statusText}`);
  }

  async getPresence(): Promise<FluxEntity[]> {
    const entities = await this.listEntities();
    return entities.filter((e) => e.type === "agent" || e.type === "member");
  }
}
