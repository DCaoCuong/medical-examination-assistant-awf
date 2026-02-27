'use client';

import React, { useEffect, useState, use } from 'react';
import { patientService, Patient } from '@/services/patientService';
import { AudioRecorder } from '@/components/AudioRecorder';
import {
    ArrowLeft,
    User,
    Calendar,
    Phone,
    FileText,
    Sparkles,
    Save,
    Clock,
    ChevronRight,
    Mic,
    RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function ExaminationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState<string>('');
    const [analysis, setAnalysis] = useState<any>(null);
    const [step, setStep] = useState(1); // 1: Recording, 2: Review/Analysis

    useEffect(() => {
        async function loadPatient() {
            try {
                const data = await patientService.getPatientById(id);
                setPatient(data);
            } catch (err) {
                console.error('Failed to load patient:', err);
            } finally {
                setLoading(false);
            }
        }
        loadPatient();
    }, [id]);

    const handleRecordingComplete = async (blob: Blob) => {
        try {
            setIsProcessing(true);

            // 1. Gửi file lên STT API
            const formData = new FormData();
            formData.append('file', blob, 'recording.webm');

            const sttResponse = await axios.post('/api/ai/stt', formData);
            const text = sttResponse.data.text;
            setTranscript(text);

            // 2. Gửi transcript lên NLP Analysis
            const analysisResponse = await axios.post('/api/ai/analyze', {
                transcript: text,
                context: `Bệnh nhân: ${patient?.name}, Tiền sử: ${patient?.medical_history || 'Không'}`
            });

            // Giả sử AI trả về chuỗi JSON bọc trong markdown hoặc plain text
            let rawAnalysis = analysisResponse.data.analysis;
            try {
                // Cố gắng lọc lấy JSON nếu AI trả về kèm text
                const jsonMatch = rawAnalysis.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    setAnalysis(JSON.parse(jsonMatch[0]));
                } else {
                    setAnalysis({ raw: rawAnalysis });
                }
            } catch (e) {
                setAnalysis({ raw: rawAnalysis });
            }

            setStep(2);
        } catch (err) {
            console.error('Processing failed:', err);
            alert('Có lỗi xảy ra trong quá trình xử lý AI.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Đang tải thông tin bệnh nhân...</div>;
    if (!patient) return <div className="p-10 text-center text-red-500">Không tìm thấy bệnh nhân.</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={20} className="text-gray-500" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Phiên thăm khám</h1>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock size={12} /> {new Date().toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900">{patient.name}</p>
                            <p className="text-xs text-gray-500">ID: {patient.id.substring(0, 8)}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            {patient.name.charAt(0)}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column: Patient Info & Steps */}
                    <div className="lg:col-span-4 space-y-6">
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Thông tin bệnh nhân</h2>
                            <div className="space-y-4">
                                <InfoItem icon={<User size={16} />} label="Họ tên" value={patient.name} />
                                <InfoItem icon={<Calendar size={16} />} label="Ngày sinh" value={patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('vi-VN') : 'N/A'} />
                                <InfoItem icon={<Phone size={16} />} label="Điện thoại" value={patient.phone || 'N/A'} />
                                <div className="pt-4 border-t border-gray-50">
                                    <p className="text-xs font-semibold text-gray-400 mb-2">TIỀN SỬ BỆNH LÝ</p>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {patient.medical_history || 'Chưa có thông tin ghi nhận.'}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-blue-600 p-6 rounded-2xl shadow-lg text-white">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Sparkles size={20} /> Hướng dẫn AI
                            </h2>
                            <ul className="text-sm space-y-3 opacity-90">
                                <li className="flex gap-2">
                                    <span className="w-5 h-5 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center text-xs">1</span>
                                    Bắt đầu ghi âm khi bắt đầu thăm khám.
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-5 h-5 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center text-xs">2</span>
                                    Nói rõ ràng các triệu chứng và chẩn đoán.
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-5 h-5 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center text-xs">3</span>
                                    AI sẽ tự động nhận diện và điền vào mẫu SOAP.
                                </li>
                            </ul>
                        </section>
                    </div>

                    {/* Right Column: Interaction Area */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                                            <Mic size={40} />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ghi âm phiên khám</h2>
                                        <p className="text-gray-500 max-w-md mb-8">
                                            Hệ thống sẽ ghi lại cuộc trò chuyện và tự động chuyển hóa thành hồ sơ y tế chuyên nghiệp.
                                        </p>

                                        <AudioRecorder onComplete={handleRecordingComplete} isProcessing={isProcessing} />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                <FileText className="text-blue-600" /> Kết quả phân tích AI
                                            </h2>
                                            <button
                                                onClick={() => setStep(1)}
                                                className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1"
                                            >
                                                <RotateCcw size={14} /> Ghi âm lại
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            <section>
                                                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Văn bản thô (Transcription)</h3>
                                                <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 italic border border-gray-100">
                                                    "{transcript}"
                                                </div>
                                            </section>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <SoapCard title="S - Subjective (Chủ quan)" content={analysis?.subjective || analysis?.S || 'Đang cập nhật...'} color="bg-orange-50 text-orange-700" />
                                                <SoapCard title="O - Objective (Khách quan)" content={analysis?.objective || analysis?.O || 'Đang cập nhật...'} color="bg-blue-50 text-blue-700" />
                                                <SoapCard title="A - Assessment (Đánh giá)" content={analysis?.assessment || analysis?.A || 'Đang cập nhật...'} color="bg-purple-50 text-purple-700" />
                                                <SoapCard title="P - Plan (Kế hoạch)" content={analysis?.plan || analysis?.P || 'Đang cập nhật...'} color="bg-green-50 text-green-700" />
                                            </div>

                                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                                <h3 className="text-sm font-bold text-blue-800 mb-2">Chuẩn đoán gợi ý & Mã ICD-10</h3>
                                                <p className="text-sm text-blue-700">
                                                    {analysis?.diagnosis || 'Chưa xác định'} - <span className="font-mono font-bold">{analysis?.icd_codes || 'N/A'}</span>
                                                </p>
                                            </div>

                                            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                                <button className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                                                    Chỉnh sửa tay
                                                </button>
                                                <button className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold flex items-center gap-2 shadow-lg shadow-blue-100">
                                                    <Save size={18} /> Lưu hồ sơ bệnh án
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="text-gray-400">{icon}</div>
            <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold leading-none mb-1">{label}</p>
                <p className="text-sm text-gray-700 font-medium">{value}</p>
            </div>
        </div>
    );
}

function SoapCard({ title, content, color }: { title: string; content: string; color: string }) {
    return (
        <div className={`p-4 rounded-xl border border-transparent ${color.split(' ')[0]} bg-opacity-50`}>
            <h4 className="text-xs font-bold mb-2 uppercase">{title}</h4>
            <p className="text-sm leading-relaxed">{content}</p>
        </div>
    );
}
