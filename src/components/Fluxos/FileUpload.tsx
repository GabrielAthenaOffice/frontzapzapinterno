import React, { useState, useRef } from 'react';
import { Upload, FileArchive, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
    accept?: string;
    maxSize?: number; // em MB
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, accept = '.zip', maxSize = 100 }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        setError(null);

        // Validar tamanho
        if (file.size > maxSize * 1024 * 1024) {
            setError(`Arquivo muito grande. Máximo: ${maxSize}MB`);
            return;
        }

        // Validar tipo
        if (accept && !file.name.endsWith('.zip')) {
            setError('Formato inválido. Envie um arquivo .zip');
            return;
        }

        setSelectedFile(file);
        onFileSelect(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleRemove = () => {
        setSelectedFile(null);
        onFileSelect(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="w-full">
            {!selectedFile ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
                        transition-all duration-300
                        ${isDragging
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 bg-gray-50 dark:bg-slate-800/30 hover:bg-gray-100 dark:hover:bg-slate-800/50'
                        }
                        ${error ? 'border-red-500/50' : ''}
                    `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleInputChange}
                        className="hidden"
                    />

                    <div className="flex flex-col items-center gap-4">
                        <div className={`
                            p-4 rounded-full transition-colors
                            ${isDragging ? 'bg-blue-500/20' : 'bg-gray-200 dark:bg-slate-700/50'}
                        `}>
                            <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-500' : 'text-gray-500 dark:text-slate-400'}`} />
                        </div>

                        <div>
                            <p className="text-gray-700 dark:text-slate-200 font-medium">
                                Arraste o arquivo ZIP aqui
                            </p>
                            <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">
                                ou clique para selecionar (máx. {maxSize}MB)
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/20">
                        <FileArchive className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-gray-800 dark:text-slate-200 font-medium truncate">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500 dark:text-slate-500">{formatFileSize(selectedFile.size)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <button
                            onClick={handleRemove}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 mt-3 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
