import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    tokens: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    totalAnalyses: { type: Number, default: 0 },
    analysisHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Analysis" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const User = mongoose.model("User", userSchema);
export default User;
