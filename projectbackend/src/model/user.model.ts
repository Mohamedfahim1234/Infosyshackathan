import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    phone: string;
    otp: string;
    isVerified: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    }

const userSchema = new mongoose.Schema<IUser>({
    name: { type: String, },
    email: { type: String, },
    phone: { type: String, },
    otp: { type: String, },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
})

const User = mongoose.model<IUser>('User', userSchema);
export default User;