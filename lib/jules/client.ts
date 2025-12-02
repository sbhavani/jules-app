import type { Source, Session, Activity, CreateSessionRequest, CreateActivityRequest } from '@/types/jules';

export class JulesAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'JulesAPIError';
  }
}

export class JulesClient {
  private baseURL = '/api/jules';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Build URL with path as query param for our proxy
    const url = `${this.baseURL}?path=${encodeURIComponent(endpoint)}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Jules-Api-Key': this.apiKey,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));

        // Handle common HTTP errors with helpful messages
        if (response.status === 401) {
          throw new JulesAPIError(
            'Invalid API key. Please check your Jules API key in settings.',
            response.status,
            error
          );
        }

        if (response.status === 403) {
          throw new JulesAPIError(
            'Access forbidden. Please ensure your API key has the correct permissions.',
            response.status,
            error
          );
        }

        if (response.status === 404) {
          throw new JulesAPIError(
            'Resource not found. The requested endpoint may not exist.',
            response.status,
            error
          );
        }

        throw new JulesAPIError(
          error.message || `Request failed with status ${response.status}`,
          response.status,
          error
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof JulesAPIError) {
        throw error;
      }

      // Handle network errors with helpful messages
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new JulesAPIError(
          'Unable to connect to the server. Please check your internet connection and try again.',
          undefined,
          error
        );
      }

      // Generic network error
      throw new JulesAPIError(
        error instanceof Error ? error.message : 'Network request failed. Please try again.',
        undefined,
        error
      );
    }
  }

  // Sources
  async listSources(): Promise<Source[]> {
    const response = await this.request<{ sources: Source[] }>('/sources');
    return response.sources || [];
  }

  async getSource(id: string): Promise<Source> {
    return this.request<Source>(`/sources/${id}`);
  }

  // Sessions
  async listSessions(sourceId?: string): Promise<Session[]> {
    const params = sourceId ? `?sourceId=${sourceId}` : '';
    const response = await this.request<{ sessions: any[] }>(`/sessions${params}`);

    // Transform API response to match our Session type
    return (response.sessions || []).map((session: any) => ({
      id: session.id,
      sourceId: session.sourceContext?.source?.replace('sources/github/', '') || '',
      title: session.title,
      status: this.mapState(session.state),
      createdAt: session.createTime,
      updatedAt: session.updateTime,
      lastActivityAt: session.lastActivityAt
    }));
  }

  private mapState(state: string): Session['status'] {
    const stateMap: Record<string, Session['status']> = {
      'COMPLETED': 'completed',
      'ACTIVE': 'active',
      'PLANNING': 'active',
      'QUEUED': 'active',
      'FAILED': 'failed',
      'PAUSED': 'paused'
    };
    return stateMap[state] || 'active';
  }

  async getSession(id: string): Promise<Session> {
    return this.request<Session>(`/sessions/${id}`);
  }

  async createSession(data: CreateSessionRequest): Promise<Session> {
    return this.request<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteSession(id: string): Promise<void> {
    await this.request<void>(`/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  // Activities
  async listActivities(sessionId: string): Promise<Activity[]> {
    const response = await this.request<{ activities: any[] }>(
      `/sessions/${sessionId}/activities`
    );

    // Transform API response to match our Activity type
    return (response.activities || []).map((activity: any) => {
      // Extract ID from name field (e.g., "sessions/ID/activities/ACTIVITY_ID")
      const id = activity.name?.split('/').pop() || activity.id || '';

      // Determine type and content based on activity structure
      let type: Activity['type'] = 'message';
      let content = '';

      // Extract content from various possible fields
      if (activity.planGenerated) {
        type = 'plan';
        const plan = activity.planGenerated.plan || activity.planGenerated;
        content = plan.description || plan.summary || plan.title || JSON.stringify(plan.steps || plan, null, 2);
      } else if (activity.progressUpdated) {
        type = 'progress';
        content = activity.progressUpdated.progressDescription ||
                  activity.progressUpdated.description ||
                  activity.progressUpdated.message ||
                  JSON.stringify(activity.progressUpdated, null, 2);
      } else if (activity.sessionCompleted) {
        type = 'result';
        const result = activity.sessionCompleted;
        content = result.summary || result.message || 'Session completed';
      } else if (activity.userMessage) {
        type = 'message';
        content = activity.userMessage.message || activity.userMessage.content || '';
      }

      // Fallback: try common content fields
      if (!content) {
        content = activity.message ||
                  activity.content ||
                  activity.text ||
                  activity.description ||
                  (activity.artifacts ? JSON.stringify(activity.artifacts, null, 2) : '') ||
                  '';
      }

      // Last resort: show activity type
      if (!content) {
        content = `[${Object.keys(activity).filter(k => !['name', 'createTime', 'originator', 'id'].includes(k)).join(', ')}]`;
      }

      return {
        id,
        sessionId,
        type,
        role: (activity.originator === 'agent' ? 'agent' : 'user') as Activity['role'],
        content,
        createdAt: activity.createTime,
        metadata: activity
      };
    });
  }

  async createActivity(data: CreateActivityRequest): Promise<Activity> {
    // Jules API uses :sendMessage endpoint for sending messages
    return this.request<Activity>(`/sessions/${data.sessionId}:sendMessage`, {
      method: 'POST',
      body: JSON.stringify({ message: data.content }),
    });
  }
}

// Helper to create a client instance
export function createJulesClient(apiKey: string): JulesClient {
  return new JulesClient(apiKey);
}
