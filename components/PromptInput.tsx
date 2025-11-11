

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GenerateIcon } from './icons/GenerateIcon';
import { CogIcon } from './icons/CogIcon';
import { AIModel } from '../types';
import { WebAppIcon } from './icons/WebAppIcon';
import { MobileAppIcon } from './icons/MobileAppIcon';
import { APIIcon } from './icons/APIIcon';
import { BlogIcon } from './icons/BlogIcon';
import { GeminiIcon } from './icons/GeminiIcon';
import { OpenAIIcon } from './icons/OpenAIIcon';
import { AnthropicIcon } from './icons/AnthropicIcon';
// FIX: Add imports for missing AI model icons.
import { DeepseekIcon } from './icons/DeepseekIcon';
import { QwenIcon } from './icons/QwenIcon';
import { XAIIcon } from './icons/XAIIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { CheckIcon } from './icons/CheckIcon';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  availableModels: AIModel[];
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;
  fetchAvailableModels: () => void;
}

// FIX: Add missing properties for 'deepseek', 'qwen', and 'xai' to satisfy the 'Record<AIModel, ...>' type.
const modelInfo: Record<AIModel, { name: string; Icon: React.FC<{className?: string}> }> = {
  gemini: { name: 'Gemini', Icon: GeminiIcon },
  openai: { name: 'OpenAI', Icon: OpenAIIcon },
  anthropic: { name: 'Anthropic', Icon: AnthropicIcon },
  deepseek: { name: 'DeepSeek', Icon: DeepseekIcon },
  qwen: { name: 'Qwen (Alibaba)', Icon: QwenIcon },
  xai: { name: 'xAI Grok', Icon: XAIIcon },
};


const projectTemplates = [
  {
    name: 'Full-Stack Web App',
    description: 'A complete web application with a frontend, backend, and database.',
    Icon: WebAppIcon,
    prompt: 'Build a full-stack web application for project management. The frontend should be in React with TypeScript and Tailwind CSS. The backend should be a Node.js/Express server with RESTful APIs for tasks, projects, and users. Use Supabase for the database with tables for users, projects, tasks, and comments. Implement JWT-based authentication for user login and protected routes.'
  },
  {
    name: 'Mobile App',
    description: 'A cross-platform mobile app for iOS and Android.',
    Icon: MobileAppIcon,
    prompt: 'Create a cross-platform mobile app using React Native and Expo for a social fitness tracker. The app should have user profiles, activity logging (e.g., running, cycling), and a social feed to see friends\' activities. Use Supabase for the backend, including user authentication and data storage. Implement push notifications for new friend activity.'
  },
  {
    name: 'Backend API Server',
    description: 'A RESTful API server to power a web or mobile client.',
    Icon: APIIcon,
    prompt: 'Develop a secure RESTful API for an e-commerce platform using Node.js and Fastify. The API should include endpoints for products, user accounts, orders, and a Stripe integration for payments. Define the database schema for PostgreSQL with tables for products, users, orders, and order_items. Ensure all API endpoints are documented with OpenAPI (Swagger).'
  },
  {
    name: 'Blog / CMS',
    description: 'A content-focused website with a headless CMS.',
    Icon: BlogIcon,
    prompt: 'Build a personal blog using Next.js for the frontend, optimized for SEO and performance with static site generation (SSG). The blog should source its content from a headless CMS like Strapi or Sanity. Features should include markdown support for posts, syntax highlighting for code blocks, categories/tags for organization, and a simple, clean design with Tailwind CSS.'
  }
];


const examplePrompts: { category: string; prompts: { name: string; text: string }[] }[] = [
  {
    category: 'Productivity & Tools',
    prompts: [
      { name: 'Pomodoro Timer', text: 'A minimalist pomodoro timer app with customizable work/break intervals and a clean, modern UI.' },
      { name: 'Kanban Board', text: 'A Trello-like Kanban board for project management with drag-and-drop cards, columns, and user assignments.' },
      { name: 'Markdown Notes App', text: 'A simple markdown note-taking app with folder organization, real-time preview, and local storage persistence.' },
      { name: 'Finance Dashboard', text: 'A personal finance dashboard using the Plaid API to visualize spending habits and set monthly budgets.' },
    ],
  },
  {
    category: 'Social & Community',
    prompts: [
      { name: 'Book Club App', text: 'A social platform for book lovers to create clubs, track reading progress, and discuss books. Include user profiles and a recommendation engine.' },
      { name: 'Local Events Finder', text: 'An app to discover local events, filter by category, and RSVP. Integrate with Mapbox for a map view.' },
      { name: 'Family Photo Sharing', text: 'A private photo sharing app for families with albums, comments, and email notifications for new uploads.' },
      { name: 'Online Forum', text: 'A classic discussion forum with categories, threads, user profiles, and a simple moderation system.' },
    ],
  },
  {
    category: 'E-commerce & Business',
    prompts: [
      { name: 'Handmade Marketplace', text: 'An e-commerce platform for handmade goods with seller dashboards, Stripe checkout, and a product review system.' },
      { name: 'Subscription Box', text: 'A landing page and user portal for a monthly subscription box service, including plan selection and Stripe recurring payments.' },
      { name: 'Restaurant Booking', text: 'A reservation system for a restaurant, allowing users to view available tables, book a time slot, and receive email confirmations.' },
      { name: 'Job Board', text: 'A niche job board for remote developers, with company profiles, job postings, and application forms that email the recruiter.' },
    ],
  },
  {
    category: 'Content & Media',
    prompts: [
      { name: 'AI Fitness Coach', text: 'A mobile-first fitness app that generates personalized workout plans, tracks progress with charts, and includes a video library for exercises.' },
      { name: 'Recipe Platform', text: 'A recipe discovery platform using a public API, with search, save-to-favorites, and a weekly meal planner.' },
      { name: 'Tech Blog', text: 'A developer-focused blog platform with markdown support, syntax highlighting, and a comment section.' },
      { name: 'Podcast Player', text: 'A simple podcast player app that fetches episodes from an RSS feed, with playback controls and a list of available episodes.' },
    ]
  }
];


const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onGenerate, isLoading, availableModels, selectedModel, setSelectedModel, fetchAvailableModels }) => {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const modelSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAvailableModels();
  }, [fetchAvailableModels]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target as Node)) {
        setIsModelSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      onGenerate();
    }
  };

  const handleTemplateSelect = (template: typeof projectTemplates[0]) => {
    setPrompt(template.prompt);
    setActiveTemplate(template.name);
  };
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (activeTemplate) {
      setActiveTemplate(null);
    }
  };
  
  const SelectedModelIcon = modelInfo[selectedModel]?.Icon || (() => null);
  const selectedModelName = modelInfo[selectedModel]?.name || 'Select Model';

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      <div className="h-10"></div>
       {availableModels.length > 1 && (
        <div className="mb-4 flex justify-center">
          <div className="relative" ref={modelSelectorRef}>
            <button
              onClick={() => setIsModelSelectorOpen(prev => !prev)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-glass-bg border border-glass-border rounded-full text-gray-300 hover:border-cyan/50 transition-colors duration-200 disabled:opacity-50"
            >
              <span className="text-xs text-gray-400">Model:</span>
              <SelectedModelIcon className="h-5 w-5" />
              <span className="font-semibold text-sm">{selectedModelName}</span>
              <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isModelSelectorOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isModelSelectorOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute top-full mt-2 w-48 origin-top-right bg-dark-secondary border border-glass-border rounded-lg shadow-lg p-1.5 z-10"
                >
                  {availableModels.map(model => {
                    const ModelIcon = modelInfo[model].Icon;
                    return (
                      <button
                        key={model}
                        onClick={() => {
                          setSelectedModel(model);
                          setIsModelSelectorOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-md transition-colors duration-200 ${
                          selectedModel === model ? 'bg-cyan/10 text-cyan' : 'text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        <ModelIcon className="h-5 w-5" />
                        <span className="flex-grow">{modelInfo[model].name}</span>
                        {selectedModel === model && <CheckIcon className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
      <div className={`relative w-full transition-opacity duration-300 ${isLoading ? 'opacity-60 animate-pulse-glow' : ''}`}>
        <textarea
          value={prompt}
          onChange={handlePromptChange}
          onKeyDown={handleKeyDown}
          placeholder="e.g., A photo sharing app for families with private albums, comments, and email notifications."
          className="w-full h-36 md:h-48 p-6 pr-12 bg-glass-bg border border-glass-border rounded-2xl text-base md:text-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-magenta resize-none transition-all duration-300 disabled:cursor-not-allowed"
          disabled={isLoading}
        />
        <p className="absolute bottom-3 right-4 text-xs text-gray-500">Cmd/Ctrl + Enter</p>
      </div>

      <div className="w-full max-w-4xl mx-auto my-6">
        <p className="text-sm text-gray-400 text-center mb-4">
            Start with a template or get inspired below.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {projectTemplates.map(template => (
            <button
              key={template.name}
              onClick={() => handleTemplateSelect(template)}
              disabled={isLoading}
              className={`p-4 rounded-lg bg-glass-bg border-2 text-left transition-all duration-200 hover:border-cyan hover:scale-[1.02] disabled:opacity-50
                ${activeTemplate === template.name ? 'border-cyan' : 'border-glass-border'}
              `}
            >
              <template.Icon className="h-6 w-6 mb-2 text-cyan" />
              <h4 className="font-bold text-sm text-gray-100">{template.name}</h4>
              <p className="text-xs text-gray-400 mt-1">{template.description}</p>
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-400 text-center">
            Or try one of these specific ideas:
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {examplePrompts.map(category => (
                <div key={category.category}>
                    <h4 className="text-sm font-bold uppercase text-cyan mb-3 tracking-wider">{category.category}</h4>
                    <div className="flex flex-col items-start gap-2">
                        {category.prompts.map(p => (
                            <button
                                key={p.name}
                                onClick={() => setPrompt(p.text)}
                                className="text-sm text-gray-300 hover:text-white hover:underline text-left transition-colors"
                                title={p.text}
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>


      <button
        onClick={onGenerate}
        disabled={isLoading || !prompt.trim()}
        className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white bg-gradient-to-r from-magenta to-cyan rounded-full overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-neon-magenta focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-cyan"
      >
        <span className="absolute inset-0 bg-dark-bg transition-all duration-300 group-hover:opacity-0"></span>
        <span className="relative flex items-center gap-2">
          {isLoading ? <CogIcon className="h-6 w-6 animate-spin" /> : <GenerateIcon />}
          {isLoading ? 'Generating...' : 'Generate App'}
        </span>
      </button>
    </div>
  );
};

export default React.memo(PromptInput);