import axios from 'axios';

/**
 * 🧑‍ Sơ đồ bảng 'users' trong ERD (đóng vai trò Bệnh nhân)
 */
export interface Patient {
    id: string;
    name: string;
    phone?: string;
    birth_date?: string;
    gender?: string;
    medical_history?: string;
    allergies?: string;
    blood_type?: string;
}

/**
 * 📅 Sơ đồ bảng 'bookings' (đóng vai trò Phiên khám)
 */
export interface Booking {
    id: string;
    user_id: string;
    doctor_id: string;
    status: string;
    booking_time: string;
    symptoms?: string;
}

/**
 * 📝 Sơ đồ bảng 'medical_records' (Lưu ghi chú SOAP & ICD-10)
 */
export interface MedicalRecord {
    id: string;
    booking_id: string;
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    diagnosis?: string;
    prescription?: string;
    icd_codes?: any;
    doctor_notes?: string;
}

export const patientService = {
    /**
     * Lấy danh sách bệnh nhân (từ bảng users với role = 'patient')
     */
    async getAllPatients() {
        const response = await axios.get('/api/patients');
        return response.data as Patient[];
    },

    /**
     * Lấy thông tin chi tiết bệnh nhân
     */
    async getPatientById(id: string) {
        const response = await axios.get(`/api/patients/${id}`);
        return response.data as Patient;
    },

    /**
     * Lấy lịch sử khám của bệnh nhân
     */
    async getPatientBookings(userId: string) {
        const response = await axios.get(`/api/patients/${userId}/bookings`);
        return response.data as Booking[];
    },

    /**
     * Lưu kết quả SOAP vào bảng medical_records
     */
    async saveMedicalRecord(record: Partial<MedicalRecord>) {
        const response = await axios.post('/api/medical-records', record);
        return response.data;
    }
};
