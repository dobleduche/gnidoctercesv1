import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Collaborator, ProjectChatMessage } from '../types';
import { useUserStore } from '../state/userStore';
import { SendIcon } from './icons/SendIcon';

interface ProjectChatProps {
    projectId: string;
    collaborators: Collaborator[];
}

const mockInitialMessages: (collaborators: Collaborator[]) => ProjectChatMessage[] = (collaborators) => [
    {
        user: collaborators[1],
        message: "Looks great! Can we change the primary color to lime green?",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
        user: collaborators[2],
        message: "Good idea. Also, let's make sure the login button is more prominent.",
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
];

const ProjectChat: React.FC<ProjectChatProps> = ({ projectId, collaborators }) => {
    const { user } = useUserStore();
    const [messages, setMessages] = useState<ProjectChatMessage[]>(() => mockInitialMessages(collaborators));
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const currentUser: Collaborator = {
        id: user?.uid || '4',
        name: user?.displayName || 'You',
        color: '#FF7F50',
        initials: user?.displayName?.charAt(0) || 'Y',
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: FormEvent) => {
        e.preventDefault();
        const trimmedInput = inputValue.trim();
        if (!trimmedInput) return;

        const newMessage: ProjectChatMessage = {
            user: currentUser,
            message: trimmedInput,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');
    };

    return (
        <div className="mt-4 h-96 bg-dark-secondary/50 rounded-lg flex flex-col border border-glass-border">
            <div className="flex-grow p-4 overflow-y-auto no-scrollbar space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.user.id === currentUser.id ? 'flex-row-reverse' : ''}`}>
                         <div
                            className="relative h-8 w-8 rounded-full border-2 border-dark-bg flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                            style={{ backgroundColor: msg.user.color }}
                            title={msg.user.name}
                        >
                            {msg.user.initials}
                        </div>
                        <div className={`max-w-[80%] px-3 py-2 rounded-lg ${msg.user.id === currentUser.id ? 'bg-magenta text-white' : 'bg-dark-bg text-gray-200'}`}>
                            <p className="text-sm">{msg.message}</p>
                        </div>
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </div>
             <div className="p-2 border-t border-glass-border">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Send a message..."
                        className="w-full px-4 py-2 bg-dark-bg border border-glass-border rounded-full text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-magenta"
                        aria-label="Chat message input"
                    />
                    <button type="submit" disabled={!inputValue.trim()} className="h-9 w-9 flex-shrink-0 bg-cyan text-dark-bg rounded-full flex items-center justify-center disabled:opacity-50 transition-opacity">
                        <SendIcon className="h-4 w-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProjectChat;
