import React from 'react';
import { Agent, Subtask } from './types';
import { UIAgentIcon } from './components/icons/agents/UIAgentIcon';
import { DBAgentIcon } from './components/icons/agents/DBAgentIcon';
import { BackendAgentIcon } from './components/icons/agents/BackendAgentIcon';
import { AuthAgentIcon } from './components/icons/agents/AuthAgentIcon';
import { CMSAgentIcon } from './components/icons/agents/CMSAgentIcon';
import { DeploymentAgentIcon } from './components/icons/agents/DeploymentAgentIcon';
import { SecurityAgentIcon } from './components/icons/agents/SecurityAgentIcon';
import { MonetizationAgentIcon } from './components/icons/agents/MonetizationAgentIcon';
import { ComplianceAgentIcon } from './components/icons/agents/ComplianceAgentIcon';
import { RefinerAgentIcon } from './components/icons/agents/RefinerAgentIcon';
import { CodeReviewAgentIcon } from './components/icons/agents/CodeReviewAgentIcon';


export const UI_AGENT_SUBTASKS: Omit<Subtask, 'status'>[] = [
    { name: 'Logo & Favicon' },
    { name: 'Theme Tokens' },
    { name: 'Typography Styles' },
    { name: 'Layout Grids' },
    { name: 'Iconography' },
    { name: 'Button Component' },
    { name: 'Input Component' },
    { name: 'Form Elements' },
    { name: 'Card Component' },
    { name: 'Modal Component' },
    { name: 'Navigation Shell' },
];


export const AGENT_DEFINITIONS: Agent[] = [
  {
    id: 'ui-agent',
    name: 'UI Agent',
    description: 'Generates a comprehensive, type-safe UI kit with Buttons, Inputs, Cards, and Modals based on the cyber-neon design system.',
    avatar: UIAgentIcon,
  },
  {
    id: 'db-agent',
    name: 'DB Agent',
    description: 'Constructs database schema, migrations, and seed data for Supabase.',
    avatar: DBAgentIcon,
  },
  {
    id: 'backend-agent',
    name: 'Backend Agent',
    description: 'Builds API endpoints, business logic, and authentication flows.',
    avatar: BackendAgentIcon,
  },
  {
    id: 'auth-agent',
    name: 'Auth Agent',
    description: 'Implements user sign-up, login, and session management with OAuth providers.',
    avatar: AuthAgentIcon,
  },
  {
    id: 'cms-agent',
    name: 'CMS Agent',
    description: 'Integrates a headless CMS for dynamic content and marketing pages.',
    avatar: CMSAgentIcon,
  },
  {
    id: 'deployment-agent',
    name: 'Deployment Agent',
    description: 'Creates deployment configurations for Expo EAS, Vercel, and Supabase.',
    avatar: DeploymentAgentIcon,
  },
  {
    id: 'security-agent',
    name: 'Security Agent',
    description: 'Performs OWASP checks, redacts API keys, and applies security patches.',
    avatar: SecurityAgentIcon,
  },
  {
    id: 'monetization-agent',
    name: 'Monetization Agent',
    description: 'Configures Stripe tiers, paywalls, and backend validation logic.',
    avatar: MonetizationAgentIcon,
  },
  {
    id: 'compliance-agent',
    name: 'Compliance Agent',
    description: 'Adds GDPR/HIPAA toggles, legal pages, and geofencing guards.',
    avatar: ComplianceAgentIcon,
  },
  {
    id: 'refiner-agent',
    name: 'Refiner Agent',
    description: 'Cleans up code, organizes folders, and validates TypeScript types.',
    avatar: RefinerAgentIcon,
  },
  {
    id: 'code-review-agent',
    name: 'Code Review Agent',
    description: 'Performs a final automated code review for quality, consistency, and best practices.',
    avatar: CodeReviewAgentIcon,
  },
];

export const AGENT_ERROR_MESSAGES: Record<string, string> = {
  'ui-agent': 'Failed to compile theme tokens.',
  'db-agent': 'Connection to Supabase timed out.',
  'backend-agent': 'Invalid endpoint configuration detected.',
  'deployment-agent': 'Vercel deployment script failed validation.',
  'security-agent': 'OWASP scan vulnerability threshold exceeded.',
  'monetization-agent': 'Stripe API key is invalid or expired.',
  'compliance-agent': 'Failed to generate GDPR consent page.',
  'refiner-agent': 'Circular dependency detected in file structure.',
  'code-review-agent': 'Code quality score below threshold (75%).',
};