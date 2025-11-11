import React from 'react';
import { FileTreeNode } from '../types';
import { FolderIcon } from './icons/FolderIcon';
import { FileIcon } from './icons/FileIcon';

interface TreeNodeProps {
  node: FileTreeNode;
  level: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level }) => {
  const isFolder = node.type === 'folder';
  const Icon = isFolder ? FolderIcon : FileIcon;

  return (
    <div>
      <div className="flex items-center py-0.5" style={{ paddingLeft: `${level * 1.25}rem` }}>
        <Icon className="h-4 w-4 mr-2 text-cyan flex-shrink-0" />
        <span className="text-gray-300">{node.name}</span>
        {node.comment && <span className="ml-4 text-gray-500 text-xs truncate"># {node.comment}</span>}
      </div>
      {isFolder && node.children && (
        <div>
          {node.children.map((child, index) => (
            <TreeNode key={index} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

interface FileTreeProps {
  data: FileTreeNode;
}

const FileTree: React.FC<FileTreeProps> = ({ data }) => {
  return (
    <div className="space-y-1">
      <TreeNode node={data} level={0} />
    </div>
  );
};

export default FileTree;
