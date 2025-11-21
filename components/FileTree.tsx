import React, { useState } from 'react';
import { FileTreeNode } from '../types';
import { FolderIcon } from './icons/FolderIcon';
import { FileIcon } from './icons/FileIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface TreeNodeProps {
  node: FileTreeNode;
  level: number;
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level, onFileSelect, selectedFile }) => {
  const isFolder = node.type === 'folder';
  const Icon = isFolder ? FolderIcon : FileIcon;
  // Expand first two levels by default for a better initial view
  const [isOpen, setIsOpen] = useState(level < 2);

  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(node.path);
    }
  };

  const isSelected = !isFolder && selectedFile === node.path;

  return (
    <div role="treeitem" aria-expanded={isFolder ? isOpen : undefined} aria-selected={isSelected}>
      <div
        className={`flex items-center py-0.5 rounded-sm transition-colors duration-150 cursor-pointer ${isSelected ? 'bg-cyan/20' : 'hover:bg-white/5'}`}
        style={{ paddingLeft: `${level * 1}rem` }}
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleToggle();
        }}
      >
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mr-1">
          {isFolder && (
            <ChevronRightIcon
              className={`h-3 w-3 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
              aria-hidden="true"
            />
          )}
        </div>

        <Icon className="h-4 w-4 mr-2 text-cyan flex-shrink-0" aria-hidden="true" />
        <span
          className={`text-sm select-none ${isSelected ? 'text-cyan font-semibold' : 'text-gray-300'}`}
        >
          {node.name}
        </span>
        {node.comment && (
          <span className="ml-4 text-gray-500 text-xs truncate hidden sm:inline" aria-hidden="true">
            # {node.comment}
          </span>
        )}
      </div>
      {isFolder && isOpen && node.children && (
        <div role="group">
          {node.children.map((child, index) => (
            <TreeNode
              key={index}
              node={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface FileTreeProps {
  data: FileTreeNode;
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
}

const FileTree: React.FC<FileTreeProps> = ({ data, onFileSelect, selectedFile }) => {
  return (
    <div className="space-y-0.5" role="tree" aria-label="Project file structure">
      <TreeNode node={data} level={0} onFileSelect={onFileSelect} selectedFile={selectedFile} />
    </div>
  );
};

export default FileTree;
