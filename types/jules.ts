export interface Source {
  id: string;
  name: string;
  type: 'github';
  metadata?: Record<string, unknown>;
}

export interface Session {
  id: string;
  sourceId: string;
  title: string;
  status: 'active' | 'completed' | 'failed' | 'paused';
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
}

export interface Activity {
  id: string;
  sessionId: string;
  type: 'message' | 'plan' | 'progress' | 'result' | 'error';
  role: 'user' | 'agent';
  content: string;
  diff?: string; // Unified diff patch from artifacts
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface CreateSessionRequest {
  sourceId: string;
  prompt: string;
  title?: string;
}

export interface CreateActivityRequest {
  sessionId: string;
  content: string;
  type?: 'message';
}
