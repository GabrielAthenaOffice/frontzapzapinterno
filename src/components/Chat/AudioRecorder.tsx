import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Mic, Square, Trash2, Send } from 'lucide-react';

interface AudioRecorderProps {
    onAudioReady: (audioBlob: Blob) => void;
    onCancel: () => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioReady, onCancel }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const MAX_RECORDING_TIME = 300; // 5 minutos

    // Memoizar a URL do áudio para evitar recriação constante
    const audioUrl = useMemo(() => {
        if (audioBlob) {
            return URL.createObjectURL(audioBlob);
        }
        return null;
    }, [audioBlob]);

    // Cleanup da URL quando componente desmontar ou audioBlob mudar
    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current?.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    // Auto-parar quando atingir tempo máximo
    useEffect(() => {
        if (recordingTime >= MAX_RECORDING_TIME) {
            stopRecording();
        }
    }, [recordingTime]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Detectar formato suportado pelo navegador
            const mimeType = MediaRecorder.isTypeSupported('audio/webm')
                ? 'audio/webm'
                : 'audio/mp4';

            const mediaRecorder = new MediaRecorder(stream, { mimeType });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Erro ao acessar microfone:', error);
            setError('Não foi possível acessar o microfone. Verifique as permissões.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const handleSend = () => {
        if (audioBlob) {
            // Validar tamanho (5MB)
            if (audioBlob.size > 5 * 1024 * 1024) {
                setError('Áudio muito grande. Máximo: 5MB');
                return;
            }
            onAudioReady(audioBlob);
        }
    };

    const handleCancel = () => {
        if (isRecording) {
            stopRecording();
        }
        setAudioBlob(null);
        setRecordingTime(0);
        onCancel();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Auto-iniciar gravação ao montar
    useEffect(() => {
        startRecording();
    }, []);

    if (error) {
        return (
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                >
                    <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            {/* Indicador de gravação */}
            {isRecording && (
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-mono text-gray-700 dark:text-gray-300 font-semibold">
                        {formatTime(recordingTime)}
                    </span>
                </div>
            )}

            {/* Waveform visual */}
            {isRecording && (
                <div className="flex items-center space-x-1">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="w-1 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"
                            style={{
                                height: `${Math.random() * 20 + 10}px`,
                                animationDelay: `${i * 0.1}s`,
                                animationDuration: '0.8s'
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Preview do áudio gravado */}
            {audioBlob && !isRecording && audioUrl && (
                <div className="flex-1">
                    <audio
                        src={audioUrl}
                        controls
                        className="w-full h-8"
                        style={{ maxWidth: '300px' }}
                    />
                </div>
            )}

            <div className="flex-1" />

            {/* Botões de ação */}
            <div className="flex items-center space-x-2">
                {isRecording ? (
                    <button
                        onClick={stopRecording}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                        title="Parar gravação"
                    >
                        <Square size={20} fill="white" />
                    </button>
                ) : audioBlob ? (
                    <>
                        <button
                            onClick={handleCancel}
                            className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors"
                            title="Cancelar"
                        >
                            <Trash2 size={20} />
                        </button>
                        <button
                            onClick={handleSend}
                            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors shadow-lg"
                            title="Enviar áudio"
                        >
                            <Send size={20} />
                        </button>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default AudioRecorder;
