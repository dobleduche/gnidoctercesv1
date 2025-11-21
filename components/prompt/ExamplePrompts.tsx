import React from 'react';
import { examplePrompts } from './promptConstants';

interface ExamplePromptsProps {
  onSelect: (prompt: string) => void;
}

const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ onSelect }) => {
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
      {examplePrompts.map((category) => (
        <div key={category.category}>
          <h4 className="text-sm font-bold uppercase text-cyan mb-3 tracking-wider">
            {category.category}
          </h4>
          <div className="flex flex-col items-start gap-2">
            {category.prompts.map((p) => (
              <button
                key={p.name}
                onClick={() => onSelect(p.text)}
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
  );
};

export default ExamplePrompts;
