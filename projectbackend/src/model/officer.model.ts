import mongoose from "mongoose";

export interface IOfficer extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    phone: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const officerSchema = new mongoose.Schema<IOfficer>({
    name: { type: String },
    email: { type: String },
    password: { type: String },
    phone: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Officer = mongoose.model<IOfficer>('Officer', officerSchema);
export default Officer;