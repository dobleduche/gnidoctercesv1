
import { WebAppIcon } from '../icons/WebAppIcon';
import { MobileAppIcon } from '../icons/MobileAppIcon';
import { APIIcon } from '../icons/APIIcon';
import { BlogIcon } from '../icons/BlogIcon';

export const projectTemplates = [
  {
    name: 'Full-Stack Web App',
    target: 'saas-web-app',
    stack: 'react-vite',
    description: 'A complete web application with a frontend, backend, and database.',
    Icon: WebAppIcon,
    prompt: 'Build a full-stack web application for project management. The frontend should be in React with TypeScript and Tailwind CSS. The backend should be a Node.js/Express server with RESTful APIs for tasks, projects, and users. Use Supabase for the database with tables for users, projects, tasks, and comments. Implement JWT-based authentication for user login and protected routes.'
  },
  {
    name: 'Mobile App',
    target: 'mobile-app',
    stack: 'react-native-expo',
    description: 'A cross-platform mobile app for iOS and Android.',
    Icon: MobileAppIcon,
    prompt: 'Create a cross-platform mobile app using React Native and Expo for a social fitness tracker. The app should have user profiles, activity logging (e.g., running, cycling), and a social feed to see friends\' activities. Use Supabase for the backend, including user authentication and data storage. Implement push notifications for new friend activity.'
  },
  {
    name: 'Backend API Server',
    target: 'api-server',
    stack: 'node-fastify',
    description: 'A RESTful API server to power a web or mobile client.',
    Icon: APIIcon,
    prompt: 'Develop a secure RESTful API for an e-commerce platform using Node.js and Fastify. The API should include endpoints for products, user accounts, orders, and a Stripe integration for payments. Define the database schema for PostgreSQL with tables for products, users, orders, and order_items. Ensure all API endpoints are documented with OpenAPI (Swagger).'
  },
  {
    name: 'Blog / CMS',
    target: 'blog-cms',
    stack: 'nextjs-strapi',
    description: 'A content-focused website with a headless CMS.',
    Icon: BlogIcon,
    prompt: 'Build a personal blog using Next.js for the frontend, optimized for SEO and performance with static site generation (SSG). The blog should source its content from a headless CMS like Strapi or Sanity. Features should include markdown support for posts, syntax highlighting for code blocks, categories/tags for organization, and a simple, clean design with Tailwind CSS.'
  }
];


export const examplePrompts: { category: string; prompts: { name: string; text: string }[] }[] = [
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
  },
  {
    category: 'AI & Advanced Apps',
    prompts: [
      { name: 'AI Support Chatbot', text: 'A customer support chatbot for an e-commerce site using a vector database (Supabase pgvector) for product documentation search. It needs a live chat handoff feature to connect users with human agents. Build the frontend as a React widget.' },
      { name: 'Collaborative Whiteboard', text: 'A real-time collaborative whiteboard app like Miro. Features should include drawing, sticky notes, and image uploads. Use WebSockets for real-time updates, Supabase for data storage, and show user presence indicators.' },
      { name: 'Video Analysis Pipeline', text: 'A video processing pipeline using serverless functions. It should take a user-uploaded video, generate a transcript via an AI speech-to-text service, extract key topics, and create a summary. The frontend is a dashboard to show processing status and results.' },
      { name: 'AI Art Gallery', text: 'A web app for generating images from text prompts using a text-to-image model. It needs a gallery of generated images, user profiles with authentication, a liking system, and a credit system for generations. Use cloud storage for images.' },
    ],
  }
];
