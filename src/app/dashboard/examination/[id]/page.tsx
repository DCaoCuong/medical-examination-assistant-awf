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

import { cosineSimilarity, formatAsPercentage } from '@/utils/math';

export default function ExaminationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState<number>(0); // 0: Idle, 1: STT, 2: Role/Fix, 3: Analysis, 4: Done
    const [transcript, setTranscript] = useState<string>('');
    const [transcriptSegments, setTranscriptSegments] = useState<{ role: string, text: string }[]>([]);
    const [analysis, setAnalysis] = useState<any>(null);
    const [step, setStep] = useState(1); // 1: Recording, 2: Review/Analysis
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [matchScore, setMatchScore] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [advice, setAdvice] = useState<string>('');
    const [risk, setRisk] = useState<string>('');

    // Editable SOAP fields
    const [soap, setSoap] = useState({
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        diagnosis: '',
        icd_codes: ''
    });

    useEffect(() => {
        async function init() {
            try {
                setLoading(true);
                // 1. Load patient
                const patientData = await patientService.getPatientById(id);
                setPatient(patientData);

                // 2. Create a session (booking)
                const bookingResponse = await axios.post('/api/bookings', {
                    user_id: id,
                    patient_name: patientData.name,
                    patient_phone: patientData.phone
                });
                setBookingId(bookingResponse.data.id);
            } catch (err) {
                console.error('Initialization failed:', err);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [id]);

    const handleRecordingComplete = async (blob: Blob) => {
        try {
            setIsProcessing(true);
            setProcessingStatus(1);

            const formData = new FormData();
            formData.append('file', blob, 'recording.webm');

            const sttResponse = await axios.post('/api/ai/stt', formData);

            setProcessingStatus(2);
            const text = sttResponse.data.text;
            const segments = sttResponse.data.segments || [];

            setTranscript(text);
            setTranscriptSegments(segments);

            // 2. Gửi transcript lên NLP Analysis
            setProcessingStatus(3);
            const analysisResponse = await axios.post('/api/ai/analyze', {
                transcript: text,
                context: `Bệnh nhân: ${patient?.name}, Tiền sử: ${patient?.medical_history || 'Không'}`
            });

            let rawAnalysis = analysisResponse.data.analysis;
            let parsed: any = {};
            try {
                const jsonMatch = rawAnalysis.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[0]);
                } else {
                    parsed = { subjective: rawAnalysis };
                }
            } catch (e) {
                parsed = { subjective: rawAnalysis };
            }

            setAnalysis(parsed);
            setAdvice(parsed.medical_advice || '');
            setRisk(parsed.risk_assessment || '');

            setSoap({
                subjective: parsed.subjective || parsed.S || '',
                objective: parsed.objective || parsed.O || '',
                assessment: parsed.assessment || parsed.A || '',
                plan: parsed.plan || parsed.P || '',
                diagnosis: parsed.diagnosis || '',
                icd_codes: parsed.icd_codes || ''
            });

            setStep(2);
            setProcessingStatus(4);
        } catch (err) {
            console.error('Processing failed:', err);
            setProcessingStatus(0);
            alert('Có lỗi xảy ra trong quá trình xử lý AI.');
        } finally {
            setIsProcessing(false);
        }
    };

    const calculateSimilarity = async () => {
        if (!analysis || !soap) return;
        try {
            setIsProcessing(true);

            const aiText = [
                analysis.subjective,
                analysis.objective,
                analysis.assessment,
                analysis.plan,
                analysis.diagnosis
            ].filter(Boolean).join(' ');

            const doctorText = [
                soap.subjective,
                soap.objective,
                soap.assessment,
                soap.plan,
                soap.diagnosis
            ].filter(Boolean).join(' ');

            if (!aiText || !doctorText) {
                console.warn('Empty text for similarity calculation');
                return;
            }

            const [aiEmbed, docEmbed] = await Promise.all([
                axios.post('/api/ai/embed', { text: aiText }),
                axios.post('/api/ai/embed', { text: doctorText })
            ]);

            const score = cosineSimilarity(aiEmbed.data.embedding, docEmbed.data.embedding);
            setMatchScore(score);
        } catch (err) {
            console.error('Similarity calculation failed:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = async () => {
        if (!bookingId) return;
        try {
            setIsSaving(true);
            await axios.post('/api/medical-records', {
                booking_id: bookingId,
                ...soap,
                ai_results: analysis,
                match_score: matchScore || 0
            });
            alert('Lưu hồ sơ bệnh án thành công!');
            window.location.href = `/dashboard/patients/${id}`;
        } catch (err) {
            console.error('Save failed:', err);
            alert('Lưu hồ sơ thất bại.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Đang tải thông tin...</div>;
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
                                <span className="mx-2 text-gray-300">|</span>
                                <span className="text-blue-600 font-mono">Session: {bookingId?.substring(0, 8)}</span>
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
                                    AI tóm tắt nội dung vào mẫu SOAP gợi ý.
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-5 h-5 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center text-xs">3</span>
                                    Bác sĩ chỉnh sửa và nhấn "Kiểm tra độ khớp".
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

                                        {isProcessing && (
                                            <div className="mt-10 w-full max-w-md">
                                                <div className="flex justify-between mb-2">
                                                    <StatusStep icon={<Mic size={14} />} label="STT" active={processingStatus >= 1} current={processingStatus === 1} />
                                                    <div className={`flex-1 h-[2px] mt-4 mx-2 ${processingStatus > 1 ? 'bg-blue-600' : 'bg-gray-100'}`} />
                                                    <StatusStep icon={<User size={14} />} label="Phân vai" active={processingStatus >= 2} current={processingStatus === 2} />
                                                    <div className={`flex-1 h-[2px] mt-4 mx-2 ${processingStatus > 2 ? 'bg-blue-600' : 'bg-gray-100'}`} />
                                                    <StatusStep icon={<Sparkles size={14} />} label="Phân tích" active={processingStatus >= 3} current={processingStatus === 3} />
                                                </div>
                                                <div className="text-center mt-6">
                                                    <p className="text-sm font-medium text-blue-600 animate-pulse">
                                                        {processingStatus === 1 && 'Đang chuyển giọng nói thành văn bản...'}
                                                        {processingStatus === 2 && 'Đang phân tích vai trò & sửa lỗi y tế...'}
                                                        {processingStatus === 3 && 'Đang tổng hợp hồ sơ SOAP...'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
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
                                                <FileText className="text-blue-600" /> Hồ sơ SOAP - AI Gợi ý
                                            </h2>
                                            <div className="flex gap-4">
                                                {matchScore !== null && (
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                                                        <Sparkles size={14} />
                                                        <span className="text-sm font-bold">Độ khớp: {formatAsPercentage(matchScore)}</span>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => setStep(1)}
                                                    className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1"
                                                >
                                                    <RotateCcw size={14} /> Ghi âm lại
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <section>
                                                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Hội thoại chi tiết (Transcript)</h3>
                                                <div className="max-h-60 overflow-y-auto p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
                                                    {transcriptSegments.length > 0 ? (
                                                        transcriptSegments.map((s, i) => (
                                                            <div key={i} className={`flex gap-3 ${s.role === 'doctor' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${s.role === 'doctor' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                                                                    }`}>
                                                                    {s.role === 'doctor' ? <User size={14} /> : <User size={14} className="opacity-50" />}
                                                                </div>
                                                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${s.role === 'doctor'
                                                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                                                    : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'
                                                                    }`}>
                                                                    <p className="font-bold text-[9px] uppercase mb-1 opacity-70 tracking-wider">
                                                                        {s.role === 'doctor' ? 'Bác sĩ' : 'Bệnh nhân'}
                                                                    </p>
                                                                    <p className="leading-relaxed">{s.text}</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-gray-400 italic text-center py-4">"{transcript}"</p>
                                                    )}
                                                </div>
                                            </section>

                                            {/* AI Suggestion Section (Read-only) */}
                                            {analysis && (
                                                <section className="p-6 bg-blue-50/30 rounded-2xl border border-blue-100/50">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                                                            <Sparkles size={14} />
                                                        </div>
                                                        <h3 className="text-sm font-bold text-blue-900">BẢN TÓM TẮT GỢI Ý (AI)</h3>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <ReadOnlySoap title="S - Subjective" value={analysis.subjective || analysis.S} />
                                                        <ReadOnlySoap title="O - Objective" value={analysis.objective || analysis.O} />
                                                        <ReadOnlySoap title="A - Assessment" value={analysis.assessment || analysis.A} />
                                                        <ReadOnlySoap title="P - Plan" value={analysis.plan || analysis.P} />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="p-3 bg-white/50 rounded-xl border border-blue-100">
                                                            <h4 className="text-[10px] font-bold text-blue-400 uppercase mb-1">Chuẩn đoán gợi ý</h4>
                                                            <p className="text-sm text-blue-800 font-medium">{analysis.diagnosis || 'N/A'}</p>
                                                        </div>
                                                        <div className="p-3 bg-white/50 rounded-xl border border-blue-100">
                                                            <h4 className="text-[10px] font-bold text-blue-400 uppercase mb-1">Mã ICD-10 dự kiến</h4>
                                                            <p className="text-sm text-blue-800 font-mono">{analysis.icd_codes || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </section>
                                            )}

                                            {/* Doctor Conclusion Section (Editable) */}
                                            <section className="pt-4 border-t border-dashed border-gray-200">
                                                <div className="flex items-center gap-2 mb-6">
                                                    <div className="p-1.5 bg-gray-900 text-white rounded-lg">
                                                        <User size={14} />
                                                    </div>
                                                    <h3 className="text-sm font-bold text-gray-900 uppercase">KẾT LUẬN & XÁC NHẬN CỦA BÁC SĨ</h3>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                    <SoapEditor title="S - Subjective (Chủ quan)" value={soap.subjective} onChange={(v) => setSoap({ ...soap, subjective: v })} />
                                                    <SoapEditor title="O - Objective (Khách quan)" value={soap.objective} onChange={(v) => setSoap({ ...soap, objective: v })} />
                                                    <SoapEditor title="A - Assessment (Đánh giá)" value={soap.assessment} onChange={(v) => setSoap({ ...soap, assessment: v })} />
                                                    <SoapEditor title="P - Plan (Kế hoạch)" value={soap.plan} onChange={(v) => setSoap({ ...soap, plan: v })} />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Chuẩn đoán chính thức</h3>
                                                        <input
                                                            type="text"
                                                            value={soap.diagnosis}
                                                            onChange={(e) => setSoap({ ...soap, diagnosis: e.target.value })}
                                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                                                            placeholder="Bác sĩ nhập chuẩn đoán cuối cùng..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Mã ICD-10 chốt</h3>
                                                        <input
                                                            type="text"
                                                            value={soap.icd_codes}
                                                            onChange={(e) => setSoap({ ...soap, icd_codes: e.target.value })}
                                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                                                            placeholder="VD: K29.0..."
                                                        />
                                                    </div>
                                                </div>
                                            </section>

                                            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
                                                <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-4">
                                                    <Sparkles size={18} /> Gợi ý & Cảnh báo từ Chuyên gia AI
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="text-[10px] font-bold text-blue-400 uppercase mb-2">Lời khuyên y khoa</h4>
                                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                            {advice || 'Không có gợi ý cụ thể cho trường hợp này.'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[10px] font-bold text-red-400 uppercase mb-2">Đánh giá rủi ro</h4>
                                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                            {risk || 'Không phát hiện rủi ro nghiêm trọng.'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                                <button
                                                    onClick={calculateSimilarity}
                                                    disabled={isProcessing}
                                                    className="px-6 py-2 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl hover:bg-orange-100 transition-colors font-medium flex items-center gap-2"
                                                >
                                                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                                    So sánh với AI
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
                                                >
                                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                                    Kết thúc & Lưu
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

function ReadOnlySoap({ title, value }: { title: string; value: string }) {
    return (
        <div className="p-4 bg-white/50 rounded-xl border border-blue-100/50 space-y-1">
            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{title}</h4>
            <div className="text-sm text-gray-700 leading-relaxed min-h-[1.5rem]">
                {value || <span className="text-gray-300 italic">Không có thông tin dự đoán.</span>}
            </div>
        </div>
    );
}

function SoapEditor({ title, value, onChange }: { title: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-400 uppercase">{title}</h3>
                <span className="text-[10px] text-gray-400 italic">Có thể chỉnh sửa</span>
            </div>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-36 p-4 bg-white border border-gray-200 rounded-2xl text-sm leading-relaxed outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all shadow-sm resize-none"
                placeholder={`Nhập ${title.split('-')[1]?.trim() || 'thông tin'}...`}
            />
        </div>
    );
}

// Reuse from page.tsx
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

function StatusStep({ icon, label, active, current }: { icon: React.ReactNode, label: string, active: boolean, current: boolean }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${current ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                active ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-300'
                }`}>
                {current ? <Loader2 size={16} className="animate-spin" /> : icon}
            </div>
            <span className={`text-[10px] font-bold uppercase ${active ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
        </div>
    );
}

import { Loader2 } from 'lucide-react';

