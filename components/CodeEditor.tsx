import React, { useState, useMemo, useEffect } from 'react';
import FileTree from './FileTree';
import { FileTreeNode } from '../types';

interface CodeEditorProps {
    files: Record<string, string>;
    fileTree: FileTreeNode;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ files, fileTree }) => {
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    const firstFile = useMemo(() => {
        const findFirstFile = (node: FileTreeNode): string | null => {
            if (node.type === 'file') return node.path;
            if (node.children) {
                for (const child of node.children) {
                    const found = findFirstFile(child);
                    if (found) return found;
                }
            }
            return null;
        }
        return findFirstFile(fileTree);
    }, [fileTree]);

    useEffect(() => {
        if (!selectedFile && firstFile) {
            setSelectedFile(firstFile);
        }
    }, [firstFile, selectedFile]);

    const fileContent = selectedFile ? files[selectedFile] || `// File not found: ${selectedFile}` : '// Select a file to view its content';

    return (
        <div className="w-full h-[600px] bg-dark-bg/50 border border-glass-border rounded-lg flex overflow-hidden shadow-lg">
            <div className="w-1/3 max-w-xs bg-dark-secondary/50 p-4 overflow-y-auto no-scrollbar border-r border-glass-border">
                <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">File Explorer</h3>
                <FileTree data={fileTree} onFileSelect={setSelectedFile} selectedFile={selectedFile} />
            </div>
            <div className="flex-1 flex flex-col">
                 <div className="flex-shrink-0 h-10 bg-dark-secondary/70 flex items-center px-4 border-b border-glass-border">
                    <p className="text-sm text-gray-400 truncate">{selectedFile || 'No file selected'}</p>
                 </div>
                <div className="flex-grow overflow-auto">
                    <pre className="p-4 text-sm text-gray-300 whitespace-pre-wrap font-mono h-full">
                        <code>
                            {fileContent}
                        </code>
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
