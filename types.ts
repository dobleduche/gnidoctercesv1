// The React import was removed as it caused a runtime module initialization error.
// A file containing only type definitions should not have runtime dependencies.

export enum GenerationState {
  IDLE = 'IDLE',
  ENGINEERING_PROMPT = 'ENGINEERING_PROMPT',
  RUNNING = 'RUNNING',
  PARTIAL_COMPLETED = 'PARTIAL_COMPLETED',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export type AgentStatusType = 'pending' | 'running' | 'success' | 'error';
export type SubtaskStatusType = 'pending' | 'running' | 'success';

export interface Subtask {
  name: string;
  status: SubtaskStatusType;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  // The return type was changed from JSX.Element to `any` to remove the need for a runtime React import.
  avatar: (props: { className?: string }) => any;
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
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  initials: string;
}

export interface FileTreeNode {
  name: string;
  type: 'folder' | 'file';
  comment?: string;
  children?: FileTreeNode[];
}

export type AIModel = "gemini" | "openai" | "anthropic" | "deepseek" | "qwen" | "xai";

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