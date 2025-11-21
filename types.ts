export enum GenerationState {
  IDLE = 'IDLE',
  ENGINEERING_PROMPT = 'ENGINEERING_PROMPT',
  RUNNING = 'RUNNING',
  PARTIAL_COMPLETED = 'PARTIAL_COMPLETED',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export type AgentStatusType = 'pending' | 'running' | 'success' | 'error' | 'retrying';
export type SubtaskStatusType = 'pending' | 'running' | 'success';

export interface Subtask {
  name: string;
  status: SubtaskStatusType;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar: (props: { className?: string }) => any;
  subtasks?: Omit<Subtask, 'status'>[];
}

export interface AgentStatus extends Agent {
  status: AgentStatusType;
  subtasks?: Subtask[];
  errorMessage?: string;
  retries: number;
}

export interface AppGenerationResult {
  appName: string;
  exportOptions: ('zip' | 'github' | 'deploy')[];
  requiredUserInputs: string[];
  // Added to support the new code editor feature
  fileTree: FileTreeNode;
  files: Record<string, string>;
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  initials: string;
}

export interface ProjectChatMessage {
  user: Collaborator;
  message: string;
  timestamp: string;
}

export interface FileTreeNode {
  name: string;
  type: 'folder' | 'file';
  path: string;
  comment?: string;
  children?: FileTreeNode[];
}

export type AIModel = 'gemini' | 'openai' | 'anthropic' | 'deepseek' | 'xai' | 'grok';
export type TierId = 'spark' | 'forge' | 'foundry' | 'obsidian' | 'apex';

export interface Commit {
  hash: string;
  agentId: string;
  message: string;
  author: string;
}

export interface RefinedPrompt {
  goals: string[];
  constraints: string[];
  stack: string[];
  data: string[];
  evaluation: string[];
  final_prompt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export type FeatureFlagId = 'ff_payments' | 'ff_ai_features' | 'ff_beta_dashboard';
export type FeatureFlags = Record<FeatureFlagId, boolean>;

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  tier: TierId;
  credits: number;
}

export interface Activity {
  id: string;
  type: 'generation' | 'upgrade' | 'invite';
  description: string;
  timestamp: string;
}
