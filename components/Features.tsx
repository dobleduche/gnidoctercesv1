
import React from 'react';

// Icons as sub-components
const AiIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-4 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} role="img" aria-labelledby="aiIconTitle" {...props}><title id="aiIconTitle">AI-Powered Generation Icon</title><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>;
const FullStackIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-4 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} role="img" aria-labelledby="fsIconTitle" {...props}><title id="fsIconTitle">Full-Stack Icon</title><path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3.75v3.75m3.75-3.75v3.75m-7.5-12v12h12v-12h-12z" /></svg>;
const SecureIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-4 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} role="img" aria-labelledby="secureIconTitle" {...props}><title id="secureIconTitle">Secure Icon</title><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>;
const NoCodeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-4 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} role="img" aria-labelledby="ncIconTitle" {...props}><title id="ncIconTitle">No-Code Icon</title><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" /></svg>;


const featuresData = [
  {
    icon: <AiIcon aria-hidden="true" />,
    title: 'AI-Powered Generation',
    description: 'Our multi-agent system intelligently interprets your prompt to build every component, from UI to database.',
  },
  {
    icon: <FullStackIcon aria-hidden="true" />,
    title: 'Full-Stack Output',
    description: 'Receive a complete, shippable codebase including a frontend, backend, and database configuration.',
  },
  {
    icon: <SecureIcon aria-hidden="true" />,
    title: 'Secure & Shippable',
    description: 'We perform security checks and best practices to ensure your app is ready for production from the start.',
  },
  {
    icon: <NoCodeIcon aria-hidden="true" />,
    title: 'No-Code Simplicity',
    description: 'Go from idea to deployed application without writing a single line of code. Perfect for founders and creators.',
  },
];

const FeatureCard: React.FC<{ feature: typeof featuresData[0] }> = ({ feature }) => (
  <div className="bg-white dark:bg-glass-bg border border-gray-200 dark:border-glass-border rounded-xl p-6 backdrop-blur-md transition-all duration-300 hover:border-cyan hover:-translate-y-1">
    {feature.icon}
    <h3 className="font-orbitron font-bold text-xl mb-2">{feature.title}</h3>
    <p className="text-gray-500 dark:text-gray-400 text-sm">{feature.description}</p>
  </div>
);

const Features: React.FC = () => {
  return (
    <section id="features" aria-labelledby="features-title" className="py-20 md:py-32">
      <div className="w-full max-w-5xl mx-auto text-center">
        <h2 id="features-title" className="text-3xl md:text-4xl font-orbitron font-bold mb-4">Why gnidoC terceS?</h2>
        <p className="max-w-2xl mx-auto mb-12 text-gray-600 dark:text-gray-400">We're not just a code generator. We're an AI-powered development team at your fingertips.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {featuresData.map(feature => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(Features);