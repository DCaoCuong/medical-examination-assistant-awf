'use client';

import { useEffect, useState } from 'react';
import { patientService, Patient } from '@/services/patientService';
import { Database, User, Activity, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { formatAsPercentage } from '@/utils/math';

export default function DashboardPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [stats, setStats] = useState({ totalPatients: 0, todaySessions: 0, weekSessions: 0, avgMatchScore: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [patientsData, statsRes] = await Promise.all([
                    patientService.getAllPatients(),
                    axios.get('/api/dashboard/stats')
                ]);
                setPatients(patientsData);
                setStats(statsRes.data);
                setError(null);
            } catch (err: any) {
                console.error('Failed to fetch patients:', err);
                const backendError = err.response?.data?.message || err.response?.data?.error;
                const hint = err.response?.data?.hint;
                setError(backendError ? `${backendError}${hint ? ` (${hint})` : ''}` : 'Không thể kết nối với Database. Hãy kiểm tra lại cấu hình .env.local.');
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.phone && p.phone.includes(searchTerm))
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển Bác sĩ</h1>
                        <p className="text-gray-500">Quản lý danh sách bệnh nhân và phiên khám</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Tìm tên hoặc SĐT..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                            />
                        </div>
                        <div className="bg-white p-2 px-3 rounded-lg shadow-sm flex items-center gap-2 border border-gray-100">
                            <Database size={18} className={error ? "text-red-500" : "text-green-500"} />
                            <span className="text-sm font-medium">{error ? "Chưa kết nối DB" : "DB Sẵn sàng"}</span>
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 items-center text-red-700">
                        <AlertCircle size={20} />
                        <p>{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Tổng bệnh nhân" value={stats.totalPatients.toString()} icon={<User className="text-blue-500" />} />
                    <StatCard title="Ca khám (Tuần)" value={stats.weekSessions.toString()} icon={<Activity className="text-green-500" />} />
                    <StatCard title="Hôm nay" value={stats.todaySessions.toString()} icon={<Activity className="text-purple-500" />} />
                    <StatCard title="Độ khớp AI (với BS)" value={stats.avgMatchScore > 0 ? formatAsPercentage(stats.avgMatchScore) : "-- %"} icon={<AlertCircle className="text-orange-500" />} />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-800">Danh sách bệnh nhân</h2>
                        {searchTerm && (
                            <span className="text-xs text-gray-400">Đang lọc {filteredPatients.length} kết quả</span>
                        )}
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
                                ) : filteredPatients.length > 0 ? (
                                    filteredPatients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{patient.name}</div>
                                                <div className="text-xs text-gray-400">ID: {patient.id.substring(0, 8)}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('vi-VN') : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{patient.phone || 'N/A'}</td>
                                            <td className="px-6 py-4 flex gap-2">
                                                <Link
                                                    href={`/patients/${patient.id}`}
                                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors inline-block"
                                                >
                                                    Hồ sơ
                                                </Link>
                                                <Link
                                                    href={`/examination/${patient.id}`}
                                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors inline-block"
                                                >
                                                    Kí khám
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                                            {searchTerm ? 'Không tìm thấy bệnh nhân nào khớp.' : 'Chưa có dữ liệu bệnh nhân.'}
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
