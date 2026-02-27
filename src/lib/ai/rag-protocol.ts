import protocols from '../medical/protocols.json';

export interface MedicalProtocol {
    id: string;
    name: string;
    icd10: string;
    authority: string;
    subjective_keys: string[];
    plan_guidelines: string;
}

export async function findProtocol(diagnosis: string, icdCodes: string[]): Promise<MedicalProtocol | null> {
    // Simple mock search logic: check if ICD code matches or name is in diagnosis
    const allCodes = icdCodes.map(c => c.toUpperCase());

    // 1. Search by ICD-10
    const byIcd = protocols.find(p => allCodes.includes(p.icd10.toUpperCase()));
    if (byIcd) return byIcd;

    // 2. Search by Name/Keywords
    const byName = protocols.find(p =>
        diagnosis.toLowerCase().includes(p.name.toLowerCase()) ||
        p.subjective_keys.some(key => diagnosis.toLowerCase().includes(key.toLowerCase()))
    );

    return byName || null;
}
