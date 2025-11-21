import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Chat } from '@google/genai';
import { ChatIcon } from './icons/ChatIcon';
import { XIcon } from './icons/XIcon';
import { SendIcon } from './icons/SendIcon';
import { ChatMessage } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !chatRef.current) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction:
              'You are a friendly and helpful AI assistant for a no-code app builder called "gnidoC terceS". Your goal is to help users, answer their questions about the product, and assist them in brainstorming app ideas. Keep your answers concise and helpful.',
          },
        });
        if (messages.length === 0) {
          setMessages([
            {
              role: 'model',
              content:
                "Hello! I'm your AI assistant. How can I help you build your next great app today?",
            },
          ]);
        }
      } catch (e) {
        console.error('Failed to initialize Gemini Chat:', e);
        setError('Could not connect to the AI assistant. Please check your API key configuration.');
      }
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading || !chatRef.current) return;

    const newUserMessage: ChatMessage = { role: 'user', content: trimmedInput };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatRef.current.sendMessageStream({ message: trimmedInput });

      let currentModelResponse = '';
      setMessages((prev) => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of response) {
        currentModelResponse += chunk.text;
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', content: currentModelResponse };
          return newMessages;
        });
      }
    } catch (e) {
      console.error('Error sending message:', e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Sorry, I couldn't get a response. ${errorMessage}`);
      // Remove the empty model message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="h-16 w-16 rounded-full bg-gradient-to-r from-magenta to-cyan flex items-center justify-center shadow-lg shadow-cyan/30"
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={isOpen ? 'close' : 'chat'}
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? (
                <XIcon className="h-8 w-8 text-white" />
              ) : (
                <ChatIcon className="h-8 w-8 text-white" />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-28 right-6 z-50 w-[calc(100%-3rem)] sm:w-96 h-[60vh] max-h-[700px] bg-glass-bg border-2 border-glass-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            role="dialog"
            aria-labelledby="chat-widget-title"
          >
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-glass-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-6 w-6 text-cyan" />
                <h2 id="chat-widget-title" className="font-bold text-lg">
                  AI Assistant
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="p-1 rounded-full hover:bg-white/10"
              >
                <XIcon className="h-5 w-5 text-gray-400" />
              </button>
            </header>

            {/* Messages */}
            <div className="flex-grow p-4 overflow-y-auto no-scrollbar">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.role === 'model' && (
                      <div className="h-7 w-7 rounded-full bg-cyan flex items-center justify-center flex-shrink-0">
                        <SparklesIcon className="h-4 w-4 text-dark-bg" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-magenta text-white rounded-br-none' : 'bg-dark-secondary text-gray-200 rounded-bl-none'}`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content}
                        {isLoading && index === messages.length - 1 && (
                          <span className="inline-block w-1 h-4 bg-white ml-1 animate-ping" />
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                {error && (
                  <div className="text-sm text-red-400 text-center p-2 bg-red-500/10 rounded-lg">
                    {error}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-glass-border flex-shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full px-4 py-2 bg-dark-secondary border border-glass-border rounded-full text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-magenta"
                  disabled={isLoading}
                  aria-label="Chat message input"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="h-10 w-10 flex-shrink-0 bg-cyan text-dark-bg rounded-full flex items-center justify-center disabled:opacity-50 transition-opacity"
                >
                  <SendIcon className="h-5 w-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
