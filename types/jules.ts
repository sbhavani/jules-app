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
  status: 'active' | 'completed' | 'failed' | 'paused' | 'awaiting_approval';
  rawState?: string; // Original API state
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
  branch?: string;
}

export interface Activity {
  id: string;
  sessionId: string;
  type: 'message' | 'plan' | 'progress' | 'result' | 'error';
  role: 'user' | 'agent';
  content: string;
  diff?: string; // Unified diff patch from artifacts
  bashOutput?: string; // Bash command output from artifacts
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface CreateSessionRequest {
  sourceId: string;
  prompt: string;
  title?: string;
  startingBranch?: string;
  autoCreatePr?: boolean;
}

export interface CreateActivityRequest {
  sessionId: string;
  content: string;
  type?: 'message';
}

export interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  title?: string;
  isFavorite?: boolean; // New: for favoriting templates
  tags?: string[]; // New: for categorization
  createdAt: string;
  updatedAt: string;
}
