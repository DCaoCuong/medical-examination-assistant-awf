import axios from 'axios';

export interface Patient {
    id: string;
    full_name: string;
    date_of_birth?: string;
    gender?: string;
    phone_number?: string;
    created_at: string;
}

export interface Visit {
    id: string;
    patient_id: string;
    visit_date: string;
    reason?: string;
    status: 'pending' | 'in_progress' | 'completed';
    soap_notes?: any;
}

export const patientService = {
    /**
     * Fetch list of all patients via internal API
     */
    async getAllPatients() {
        const response = await axios.get('/api/patients');
        return response.data as Patient[];
    },

    /**
     * Get patient by ID (To be implemented in API if needed)
     */
    async getPatientById(id: string) {
        const response = await axios.get(`/api/patients/${id}`);
        return response.data as Patient;
    },

    /**
     * Get current examination session
     */
    async getCurrentVisit(visitId: string) {
        const response = await axios.get(`/api/visits/${visitId}`);
        return response.data;
    },

    /**
     * Update visits with SOAP notes
     */
    async updateVisitNotes(visitId: string, payload: any) {
        const response = await axios.post(`/api/visits/${visitId}`, payload);
        return response.data;
    }
};
