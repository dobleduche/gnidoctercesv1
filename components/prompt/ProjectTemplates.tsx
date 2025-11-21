import React from 'react';
import { projectTemplates } from './promptConstants';

interface ProjectTemplatesProps {
  onSelect: (template: (typeof projectTemplates)[0]) => void;
  activeTemplate: string | null;
  isGenerationDisabled: boolean;
}

const ProjectTemplates: React.FC<ProjectTemplatesProps> = ({
  onSelect,
  activeTemplate,
  isGenerationDisabled,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {projectTemplates.map((template) => (
        <button
          key={template.name}
          onClick={() => onSelect(template)}
          disabled={isGenerationDisabled}
          className={`p-4 rounded-lg bg-glass-bg border-2 text-left transition-all duration-200 hover:border-cyan hover:scale-[1.02] disabled:opacity-50
                    ${activeTemplate === template.name ? 'border-cyan' : 'border-glass-border'}
                    `}
        >
          <template.Icon className="h-6 w-6 mb-2 text-cyan" aria-hidden="true" />
          <h4 className="font-bold text-sm text-gray-100">{template.name}</h4>
          <p className="text-xs text-gray-400 mt-1">{template.description}</p>
        </button>
      ))}
    </div>
  );
};

export default ProjectTemplates;
