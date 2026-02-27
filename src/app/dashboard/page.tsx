'use client';

import { useEffect, useState } from 'react';
import { patientService, Patient } from '@/services/patientService';
import { Database, User, Activity, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const data = await patientService.getAllPatients();
                setPatients(data);
            } catch (err: any) {
                console.error('Failed to fetch patients:', err);
                setError(err.message || 'Không thể kết nối với Database. Hãy kiểm tra lại API Key.');
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển Bác sĩ</h1>
                        <p className="text-gray-500">Quản lý danh sách bệnh nhân và phiên khám</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm flex items-center gap-2 border border-gray-100">
                        <Database size={18} className={error ? "text-red-500" : "text-green-500"} />
                        <span className="text-sm font-medium">{error ? "Chưa kết nối DB" : "DB Sẵn sàng"}</span>
                    </div>
                </header>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 items-center text-red-700">
                        <AlertCircle size={20} />
                        <p>{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Tổng bệnh nhân" value={patients.length.toString()} icon={<User className="text-blue-500" />} />
                    <StatCard title="Phiên khám hôm nay" value="0" icon={<Activity className="text-green-500" />} />
                    <StatCard title="Độ chính xác AI (trung bình)" value="-- %" icon={<AlertCircle className="text-orange-500" />} />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-800">Danh sách bệnh nhân</h2>
                        <button className="text-sm text-blue-600 font-medium hover:underline">Xem tất cả</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Bệnh nhân</th>
                                    <th className="px-6 py-3">Ngày sinh</th>
                                    <th className="px-6 py-3">Số điện thoại</th>
                                    <th className="px-6 py-3">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    [...Array(3)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                            <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20"></div></td>
                                        </tr>
                                    ))
                                ) : patients.length > 0 ? (
                                    patients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{patient.full_name}</div>
                                                <div className="text-xs text-gray-400">ID: {patient.id.substring(0, 8)}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{patient.date_of_birth || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{patient.phone_number || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <button className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                                                    Kí khám
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                                            Chưa có dữ liệu bệnh nhân.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-xl">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
