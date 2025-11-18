import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIModel } from '../../types';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { MODEL_INFO } from '../../constants';

interface ModelSelectorProps {
    availableModels: AIModel[];
    selectedModel: AIModel;
    setSelectedModel: (model: AIModel) => void;
    isGenerationDisabled: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ availableModels, selectedModel, setSelectedModel, isGenerationDisabled }) => {
    const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
    const modelSelectorRef = useRef<HTMLDivElement>(null);

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

    const SelectedModelIcon = MODEL_INFO[selectedModel]?.Icon || (() => null);
    const selectedModelName = MODEL_INFO[selectedModel]?.name || 'Select Model';

    return (
        <div className="mb-4 flex justify-center">
            <div className="relative" ref={modelSelectorRef}>
                <button
                    id="model-selector-button"
                    onClick={() => setIsModelSelectorOpen(prev => !prev)}
                    disabled={isGenerationDisabled}
                    className="flex items-center gap-2 px-4 py-2 bg-glass-bg border border-glass-border rounded-full text-gray-300 hover:border-cyan/50 transition-colors duration-200 disabled:opacity-50"
                    aria-haspopup="listbox"
                    aria-expanded={isModelSelectorOpen}
                >
                    <span className="text-xs text-gray-400">Model:</span>
                    <SelectedModelIcon className="h-5 w-5" aria-hidden="true" />
                    <span className="font-semibold text-sm">{selectedModelName}</span>
                    <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isModelSelectorOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                <AnimatePresence>
                    {isModelSelectorOpen && (
                        <motion.ul
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="absolute top-full mt-2 w-48 origin-top-right bg-dark-secondary border border-glass-border rounded-lg shadow-lg p-1.5 z-10"
                            role="listbox"
                            aria-labelledby="model-selector-button"
                            tabIndex={-1}
                        >
                            {Object.keys(MODEL_INFO).map(key => {
                                const model = key as AIModel;
                                const ModelIcon = MODEL_INFO[model].Icon;
                                const isAvailable = availableModels.includes(model);
                                return (
                                    <li
                                        key={model}
                                        onClick={() => {
                                            if (isAvailable) {
                                                setSelectedModel(model);
                                                setIsModelSelectorOpen(false);
                                            }
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-md transition-colors duration-200 ${!isAvailable ? 'opacity-50 cursor-not-allowed' : `cursor-pointer ${selectedModel === model ? 'bg-cyan/10 text-cyan' : 'text-gray-300 hover:bg-white/10'}`}`}
                                        title={!isAvailable ? `${MODEL_INFO[model].name} is not configured on the server.` : ''}
                                        role="option"
                                        aria-selected={selectedModel === model}
                                        aria-disabled={!isAvailable}
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (isAvailable && (e.key === 'Enter' || e.key === ' ')) {
                                                setSelectedModel(model);
                                                setIsModelSelectorOpen(false);
                                            }
                                        }}
                                    >
                                        <ModelIcon className="h-5 w-5" aria-hidden="true" />
                                        <span className="flex-grow">{MODEL_INFO[model].name}</span>
                                        {selectedModel === model && <CheckIcon className="h-4 w-4" aria-hidden="true" />}
                                    </li>
                                );
                            })}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ModelSelector;
