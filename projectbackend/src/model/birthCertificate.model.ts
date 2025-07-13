import mongoose from "mongoose";

export interface IBirthCertificate extends mongoose.Document {
    childName: string;
    DOB: string;
    fatherName: string;
    motherName: string;
    address: string;
    parentNativity: string;
    parentIdProof: string;
    medicalCertificate: string;
    Isapproved: boolean;
    Isrejected: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const birthCertificateSchema = new mongoose.Schema<IBirthCertificate>({
    childName: { type: String,},
    DOB: { type: String, },
    fatherName: { type: String, },
    motherName: { type: String, },
    address: { type: String, },
    parentNativity: { type: String, },
    parentIdProof: { type: String, },
    medicalCertificate: { type: String, },
    Isapproved: { type: Boolean, default: false },
    Isrejected: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const BirthCertificate = mongoose.model<IBirthCertificate>('BirthCertificate', birthCertificateSchema);
export default BirthCertificate;