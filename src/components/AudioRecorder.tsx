'use client';

import React, { useEffect, useRef } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Mic, Square, RotateCcw, Play, Check, Loader2 } from 'lucide-react';

interface AudioRecorderProps {
    onComplete: (blob: Blob) => void;
    isProcessing?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onComplete, isProcessing }) => {
    const {
        isRecording,
        audioBlob,
        recordingTime,
        startRecording,
        stopRecording,
        resetRecording,
        getAnalyzer
    } = useAudioRecorder();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);

    // Draw waveform
    useEffect(() => {
        if (isRecording && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const analyser = getAnalyzer();

            if (!ctx || !analyser) return;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const draw = () => {
                animationRef.current = requestAnimationFrame(draw);
                analyser.getByteFrequencyData(dataArray);

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const barWidth = (canvas.width / bufferLength) * 2.5;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = (dataArray[i] / 255) * canvas.height;

                    ctx.fillStyle = `rgb(59, 130, 246)`; // Blue-500
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                    x += barWidth + 1;
                }
            };

            draw();
        } else {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        }

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isRecording, getAnalyzer]);

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md mx-auto">
            <div className="flex flex-col items-center gap-6">
                <div className="text-2xl font-mono font-bold text-gray-700">
                    {formatTime(recordingTime)}
                </div>

                <div className="w-full h-24 bg-gray-50 rounded-xl overflow-hidden relative border border-gray-100">
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={100}
                        className="w-full h-full"
                    />
                    {!isRecording && !audioBlob && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm italic">
                            Nhấn nút mic để bắt đầu...
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {!isRecording && !audioBlob && (
                        <button
                            onClick={startRecording}
                            className="p-5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
                        >
                            <Mic size={28} />
                        </button>
                    )}

                    {isRecording && (
                        <button
                            onClick={stopRecording}
                            className="p-5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-lg animate-pulse"
                        >
                            <Square size={28} />
                        </button>
                    )}

                    {!isRecording && audioBlob && (
                        <>
                            <button
                                onClick={resetRecording}
                                className="p-4 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all"
                                title="Ghi lại"
                            >
                                <RotateCcw size={24} />
                            </button>

                            <button
                                onClick={() => onComplete(audioBlob)}
                                disabled={isProcessing}
                                className="px-8 py-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <Check size={24} />
                                        Xác nhận kết quả
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
