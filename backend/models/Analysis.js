import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    url: { type: String, required: true },
    scores: {
        ux: { type: Number, default: 0 },
        conversion: { type: Number, default: 0 },
        trust: { type: Number, default: 0 },
        mobile: { type: Number, default: 0 },
        performance: { type: Number, default: 0 },
        accessibility: { type: Number, default: 0 },
        bestPractices: { type: Number, default: 0 },
        seo: { type: Number, default: 0 }
    },
    issues: [{ type: String }],
    suggestions: [{ type: String }],
    pointsEarned: { type: Number, default: 10 },
    createdAt: { type: Date, default: Date.now }
});

export const Analysis = mongoose.model("Analysis", analysisSchema);
export default Analysis;
