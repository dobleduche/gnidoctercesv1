import React, { useState } from 'react';
import { ClipboardIcon } from '../icons/ClipboardIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { ExpandIcon } from '../icons/ExpandIcon';
import { CollapseIcon } from '../icons/CollapseIcon';
import { SendIcon } from '../icons/SendIcon';
import { CogIcon } from '../icons/CogIcon';

interface PromptTextareaProps {
    prompt: string;
    onChange: (value: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
    isGenerationDisabled: boolean;
}

const PromptTextarea: React.FC<PromptTextareaProps> = ({ prompt, onChange, onGenerate, isLoading, isGenerationDisabled }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (isGenerationDisabled) return;
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault(); // prevent newline
            onGenerate();
        }
    };

    const handleCopy = () => {
        if (!prompt || isCopied) return;
        navigator.clipboard.writeText(prompt).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className={`relative w-full transition-opacity duration-300 ${isGenerationDisabled ? 'opacity-60' : ''}`}>
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                <button
                    onClick={handleCopy}
                    className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    title={isCopied ? "Copied!" : "Copy prompt"}
                    aria-label={isCopied ? "Copied prompt" : "Copy prompt"}
                >
                    {isCopied ? <CheckIcon className="h-5 w-5 text-lime" /> : <ClipboardIcon className="h-5 w-5" />}
                </button>
                <button
                    onClick={() => setIsExpanded(prev => !prev)}
                    className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    title={isExpanded ? "Collapse" : "Expand"}
                    aria-label={isExpanded ? "Collapse prompt input" : "Expand prompt input"}
                >
                    {isExpanded ? <CollapseIcon className="h-5 w-5" /> : <ExpandIcon className="h-5 w-5" />}
                </button>
            </div>

            <textarea
                value={prompt}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your app: target audience, key features, tech stack preferences, and design aesthetic."
                className={`w-full p-6 bg-glass-bg border border-glass-border rounded-2xl text-base md:text-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-magenta resize-none transition-all duration-300 disabled:cursor-not-allowed pr-20 ${isExpanded ? 'h-64 md:h-80' : 'h-36 md:h-48'}`}
                disabled={isGenerationDisabled}
                aria-label="Describe your app vision"
            />

            <p className="absolute bottom-3 left-6 text-xs text-gray-500" aria-hidden="true">Cmd/Ctrl + Enter</p>

            <button
                onClick={onGenerate}
                disabled={isGenerationDisabled || !prompt.trim()}
                className="absolute bottom-4 right-4 group h-12 w-12 rounded-full bg-gradient-to-r from-magenta to-cyan flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-neon-magenta focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-cyan"
                aria-label="Generate App"
            >
                <span className="absolute inset-0 bg-dark-bg transition-all duration-300 group-hover:opacity-0 rounded-full"></span>
                {isLoading
                    ? <CogIcon className="relative h-6 w-6 text-white animate-spin" />
                    : <SendIcon className="relative h-6 w-6 text-white" />
                }
            </button>
        </div>
    );
};

export default PromptTextarea;
