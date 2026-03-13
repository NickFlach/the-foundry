export interface FoundryClientOptions {
  baseUrl?: string;
}

export class FoundryClient {
  private baseUrl: string;

  constructor(options?: FoundryClientOptions) {
    this.baseUrl = (options?.baseUrl ?? process.env.FOUNDRY_API_URL ?? "http://localhost:3000").replace(/\/$/, "");
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let res: Response;
    try {
      res = await fetch(url, {
        ...init,
        headers: { "Content-Type": "application/json", ...init?.headers },
      });
    } catch (err) {
      throw new Error(`Failed to connect to Foundry API at ${this.baseUrl}. Is the server running?`);
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as any).error ?? `HTTP ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  }

  // Health
  async health(): Promise<any> {
    return this.request("/api/health");
  }

  // Spaces
  async listSpaces(): Promise<any[]> {
    return this.request("/api/spaces");
  }

  async getSpace(id: string): Promise<any> {
    return this.request(`/api/spaces/${encodeURIComponent(id)}`);
  }

  async createSpace(data: { name: string; type: string; description?: string }): Promise<any> {
    return this.request("/api/spaces", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Posts
  async listPosts(spaceId: string, options?: { limit?: number; offset?: number }): Promise<any[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.offset) params.set("offset", String(options.offset));
    const qs = params.toString();
    return this.request(`/api/spaces/${encodeURIComponent(spaceId)}/posts${qs ? `?${qs}` : ""}`);
  }

  async createPost(spaceId: string, data: { title: string; content: string; authorId?: string; authorType?: string }): Promise<any> {
    return this.request(`/api/spaces/${encodeURIComponent(spaceId)}/posts`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Replies
  async createReply(postId: string, data: { content: string; authorId?: string; authorType?: string }): Promise<any> {
    return this.request(`/api/posts/${encodeURIComponent(postId)}/replies`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Members
  async listMembers(): Promise<any[]> {
    return this.request("/api/members");
  }

  async getMember(id: string): Promise<any> {
    return this.request(`/api/members/${encodeURIComponent(id)}`);
  }

  async createMember(data: { name: string; type: string; githubUsername?: string; bio?: string }): Promise<any> {
    return this.request("/api/members", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMember(id: string, data: { name?: string; githubUsername?: string; bio?: string }): Promise<any> {
    return this.request(`/api/members/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Flux
  async getPresence(): Promise<any[]> {
    return this.request("/api/flux/presence");
  }

  async getFluxEntity(id: string): Promise<any> {
    return this.request(`/api/flux/entity/${encodeURIComponent(id)}`);
  }

  // Knowledge
  async listArticles(filters?: { category?: string; tag?: string; author?: string }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.set("category", filters.category);
    if (filters?.tag) params.set("tag", filters.tag);
    if (filters?.author) params.set("author", filters.author);
    const qs = params.toString();
    return this.request(`/api/knowledge${qs ? `?${qs}` : ""}`);
  }

  async getArticle(idOrSlug: string): Promise<any> {
    return this.request(`/api/knowledge/${encodeURIComponent(idOrSlug)}`);
  }

  async createArticle(data: { title: string; content: string; category: string; tags?: string[]; authorId?: string; authorType?: string }): Promise<any> {
    return this.request("/api/knowledge", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateArticle(id: string, data: { content: string; changeSummary?: string; authorId?: string }): Promise<any> {
    return this.request(`/api/knowledge/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getRevisions(articleId: string): Promise<any[]> {
    return this.request(`/api/knowledge/${encodeURIComponent(articleId)}/revisions`);
  }

  async searchArticles(query: string): Promise<any[]> {
    return this.request(`/api/knowledge?q=${encodeURIComponent(query)}`);
  }

  // Wasteland
  async getWanted(filters?: { project?: string; status?: string }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.project) params.set("project", filters.project);
    if (filters?.status) params.set("status", filters.status);
    const qs = params.toString();
    return this.request(`/api/wasteland/wanted${qs ? `?${qs}` : ""}`);
  }

  async getRigs(): Promise<any> {
    return this.request("/api/wasteland/rigs");
  }

  async getStats(): Promise<any> {
    return this.request("/api/wasteland/stats");
  }
}
