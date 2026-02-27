'use client';

import { useEffect, useState, use } from 'react';
import { patientService, Patient, MedicalRecord } from '@/services/patientService';
import {
    User, Calendar, Phone, Droplets, AlertTriangle,
    ChevronLeft, FileText, Clock, ChevronRight,
    Stethoscope, Activity, ClipboardList, Pill
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [history, setHistory] = useState<(MedicalRecord & { booking_time: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState<(MedicalRecord & { booking_time: string }) | null>(null);

    useEffect(() => {
        async function loadPatientData() {
            try {
                setLoading(true);
                const [patientData, historyData] = await Promise.all([
                    patientService.getPatientById(id),
                    patientService.getPatientHistory(id)
                ]);
                setPatient(patientData);
                setHistory(historyData);
                if (historyData.length > 0) {
                    setSelectedRecord(historyData[0]);
                }
            } catch (err) {
                console.error('Failed to load patient history:', err);
            } finally {
                setLoading(false);
            }
        }
        loadPatientData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium tracking-wide">Đang tải hồ sơ bệnh nhân...</p>
                </div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center gap-4">
                <AlertTriangle size={48} className="text-orange-400" />
                <h1 className="text-xl font-bold text-gray-900">Không tìm thấy bệnh nhân</h1>
                <Link href="/" className="text-blue-600 hover:underline">Quay lại Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm print:hidden">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-500">
                            <ChevronLeft size={20} />
                        </Link>
                        <h1 className="text-lg font-bold text-gray-900">Chi tiết Hồ sơ Bệnh nhân</h1>
                    </div>
                    <Link
                        href={`/examination/${patient.id}`}
                        className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                    >
                        <Stethoscope size={16} /> Bắt đầu khám mới
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Patient Info & Timeline */}
                <div className="lg:col-span-4 space-y-6 print:hidden">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                        <div className="flex flex-col items-center mb-8 pt-4">
                            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-xl relative overflow-hidden group">
                                <User size={40} />
                                <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">{patient.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-2 py-0.5 bg-blue-50 rounded-md">Bệnh nhân</span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {patient.id.substring(0, 8)}</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-50">
                            <ProfileInfo icon={<Droplets size={16} className="text-red-500" />} label="Nhóm máu" value={patient.blood_type || 'Chưa rõ'} />
                            <ProfileInfo icon={<Calendar size={16} className="text-blue-500" />} label="Ngày sinh" value={patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('vi-VN') : 'N/A'} />
                            <ProfileInfo icon={<Phone size={16} className="text-green-500" />} label="Số điện thoại" value={patient.phone || 'N/A'} />
                        </div>

                        {patient.allergies && (
                            <div className="mt-8 p-4 bg-red-50/50 rounded-2xl border border-red-100/50">
                                <h3 className="text-[10px] font-black text-red-600 uppercase mb-2 flex items-center gap-2 tracking-widest">
                                    <AlertTriangle size={12} /> Tiền sử Dị ứng
                                </h3>
                                <p className="text-sm text-red-900 leading-relaxed font-bold">
                                    {patient.allergies}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-xs font-black text-gray-400 uppercase mb-8 flex items-center gap-2 tracking-[0.2em]">
                            <History size={14} /> Dòng thời gian điều trị
                        </h3>
                        <div className="relative space-y-0">
                            {/* Vertical Line Connector */}
                            <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-gray-100" />

                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar relative">
                                {history.length > 0 ? (
                                    history.map((record, idx) => (
                                        <div key={record.id} className="relative flex items-start gap-4">
                                            {/* Timeline dot */}
                                            <div className={`z-10 w-3 h-3 rounded-full mt-6 border-2 border-white shadow-sm ring-4 ${selectedRecord?.id === record.id ? 'bg-blue-600 ring-blue-100' : 'bg-gray-300 ring-gray-50'
                                                }`} />

                                            <button
                                                onClick={() => setSelectedRecord(record)}
                                                className={`flex-1 text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${selectedRecord?.id === record.id
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]'
                                                    : 'bg-white border-gray-100 hover:border-blue-200 hover:translate-x-1'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <p className={`text-[9px] font-black uppercase tracking-wider mb-0.5 ${selectedRecord?.id === record.id ? 'text-blue-100' : 'text-gray-400'}`}>
                                                            {idx === 0 ? 'Mới nhất' : idx === history.length - 1 ? 'Khám đầu' : 'Phiên khám'}
                                                        </p>
                                                        <p className="text-sm font-bold truncate max-w-[180px]">
                                                            {record.diagnosis || 'Chưa rõ chuẩn đoán'}
                                                        </p>
                                                        <p className={`text-[10px] mt-1 ${selectedRecord?.id === record.id ? 'text-blue-200' : 'text-gray-400'}`}>
                                                            {new Date(record.booking_time).toLocaleDateString('vi-VN')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <ChevronRight size={14} className={selectedRecord?.id === record.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <Clock size={32} className="mx-auto text-gray-200 mb-2" />
                                        <p className="text-gray-400 text-sm italic">Chưa có dữ liệu phiên khám.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Record Details & Insights */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Multi-Visit Insights (Only if > 1 visit) */}
                    {history.length > 1 && (
                        <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden print:hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">Hành trình y khoa</p>
                                    <h3 className="text-2xl font-black">{history.length} Phiên khám</h3>
                                    <p className="text-sm text-blue-100/60 mt-2 font-medium">Bắt đầu từ {new Date(history[history.length - 1].booking_time).toLocaleDateString('vi-VN')}</p>
                                </div>
                                <div className="md:border-l md:border-white/10 md:pl-8">
                                    <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">Chuẩn đoán chính</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold border border-white/10">
                                            {history[0].diagnosis || 'N/A'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-blue-100/60 mt-2 font-medium">Mới nhất cập nhật ngày {new Date(history[0].booking_time).toLocaleDateString('vi-VN')}</p>
                                </div>
                                <div className="md:border-l md:border-white/10 md:pl-8">
                                    <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">Ghi chú gần nhất</p>
                                    <p className="text-sm text-blue-50 font-medium italic line-clamp-2">
                                        "{history[0].doctor_notes || 'Không có ghi chú đặc biệt.'}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {selectedRecord ? (
                            <motion.div
                                key={selectedRecord.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden"
                            >
                                <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-white to-blue-50/20">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] leading-none mb-1">Hồ sơ điện tử</p>
                                                <p className="text-xs font-bold text-gray-400">Ngày {new Date(selectedRecord.booking_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {new Date(selectedRecord.booking_time).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                        </div>
                                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">{selectedRecord.diagnosis || 'Chưa nhập chuẩn đoán'}</h2>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="px-6 py-2 bg-green-50 text-green-600 rounded-full text-xs font-black uppercase tracking-[0.15em] border border-green-100 shadow-sm">
                                            Hoàn tất phiên
                                        </div>
                                    </div>
                                </div>

                                <div className="p-10 space-y-12">
                                    {/* SOAP Detail View */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                                        {/* Background Decor */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] scale-150">
                                            <Stethoscope size={400} />
                                        </div>

                                        <RecordSection
                                            icon={<Stethoscope size={20} />}
                                            title="Chủ quan (S)"
                                            subtitle="Cảm nhận và mô tả của bệnh nhân"
                                            content={selectedRecord.subjective}
                                            className="border-blue-200/50 bg-blue-50/5"
                                        />
                                        <RecordSection
                                            icon={<Activity size={20} />}
                                            title="Khách quan (O)"
                                            subtitle="Kết quả khám, xét nghiệm thực tế"
                                            content={selectedRecord.objective}
                                            className="border-emerald-200/50 bg-emerald-50/5"
                                        />
                                        <RecordSection
                                            icon={<ClipboardList size={20} />}
                                            title="Đánh giá (A)"
                                            subtitle="Phân tích tình trạng bệnh lý"
                                            content={selectedRecord.assessment}
                                            className="border-orange-200/50 bg-orange-50/5"
                                        />
                                        <RecordSection
                                            icon={<Pill size={20} />}
                                            title="Kế hoạch (P)"
                                            subtitle="Phác đồ điều trị và dặn dò"
                                            content={selectedRecord.plan}
                                            className="border-indigo-200/50 bg-indigo-50/5"
                                        />
                                    </div>

                                    {/* Footer Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-gray-100">
                                        <div className="space-y-5">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Danh mục ICD-10 chốt</h4>
                                            <div className="flex flex-wrap gap-3">
                                                {renderIcdCodes(selectedRecord.icd_codes)}
                                            </div>
                                        </div>
                                        <div className="space-y-5">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Lời dặn từ Bác sĩ</h4>
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                                                <p className="text-sm text-gray-700 leading-relaxed font-bold italic">
                                                    "{selectedRecord.doctor_notes || 'Không có hướng dẫn bổ sung.'}"
                                                </p>
                                                <div className="absolute -top-3 -left-2 bg-white p-1 rounded-lg border border-gray-100">
                                                    <Pill size={14} className="text-blue-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Hồ sơ đã được mã hóa bảo mật</p>
                                    </div>
                                    <div className="flex gap-4 print:hidden">
                                        <button
                                            onClick={() => window.print()}
                                            className="px-5 py-2 hover:bg-white hover:shadow-md transition-all rounded-xl text-sm font-bold text-gray-600 flex items-center gap-2"
                                        >
                                            <FileText size={16} /> Print
                                        </button>
                                        <button
                                            onClick={() => window.print()}
                                            className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
                                        >
                                            Xuất Bệnh Án (PDF)
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-[700px] flex flex-col items-center justify-center text-gray-300 bg-white rounded-[3rem] border-4 border-dashed border-gray-50 group">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FileText size={48} className="opacity-20 text-gray-900" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">Chưa chọn phiên khám</h3>
                                <p className="font-medium italic text-sm">Vui lòng chọn một mốc thời gian từ dòng lịch sử bên trái.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

function ProfileInfo({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center gap-4 group">
            <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-white group-hover:shadow-md transition-all">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-base font-bold text-gray-900 leading-none">{value}</p>
            </div>
        </div>
    );
}

function RecordSection({ icon, title, subtitle, content, className }: { icon: React.ReactNode, title: string, subtitle: string, content?: string, className: string }) {
    return (
        <div className={`p-6 rounded-3xl border-l-4 shadow-sm bg-white transition-all hover:shadow-md ${className}`}>
            <div className="flex items-center gap-2 mb-1 text-gray-400">
                {icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{title}</span>
            </div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-3">{subtitle}</p>
            <p className="text-sm text-gray-700 leading-relaxed font-semibold whitespace-pre-wrap">
                {content || <span className="text-gray-300 italic">Không có dữ liệu</span>}
            </p>
        </div>
    );
}

function renderIcdCodes(codes: any) {
    if (!codes) return <span className="text-sm text-gray-400 italic">N/A</span>;
    let codeArr: string[] = [];
    try {
        if (typeof codes === 'string') {
            codeArr = JSON.parse(codes);
        } else if (Array.isArray(codes)) {
            codeArr = codes;
        }
    } catch {
        codeArr = [String(codes)];
    }

    return codeArr.map((code, idx) => (
        <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-black font-mono border border-blue-100">
            {code}
        </span>
    ));
}

function History({ size, className }: { size: number, className?: string }) {
    return <Clock size={size} className={className} />;
}
