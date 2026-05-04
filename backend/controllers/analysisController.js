import axios from "axios";
import Analysis from "../models/Analysis.js";
import User from "../models/User.js";
import { calculateTokensEarned, calculateLevel } from "../utils/helpers.js";

export const analyzeWebsite = async (req, res) => {
    try {
        const { url } = req.body;
        const userId = req.userId;

        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        // Get scores from Google PageSpeed
        const [desktopRes, mobileRes] = await Promise.all([
            axios.get("https://www.googleapis.com/pagespeedonline/v5/runPagespeed", {
                params: {
                    url: url,
                    key: process.env.GOOGLE_API_KEY,
                    strategy: "desktop"
                }
            }),
            axios.get("https://www.googleapis.com/pagespeedonline/v5/runPagespeed", {
                params: {
                    url: url,
                    key: process.env.GOOGLE_API_KEY,
                    strategy: "mobile"
                }
            })
        ]);

        const desktop = desktopRes.data.lighthouseResult || {};
        const mobile = mobileRes.data.lighthouseResult || {};
        const dCat = desktop.categories || {};
        const mCat = mobile.categories || {};
        const audits = mobile.audits || {};

        // Calculate scores
        const performance = Math.round(
            (((dCat.performance?.score ?? 0.5) + (mCat.performance?.score ?? 0.5)) / 2) * 100
        );
        const accessibility = Math.round(
            (((dCat.accessibility?.score ?? 0.5) + (mCat.accessibility?.score ?? 0.5)) / 2) * 100
        );
        const bestPractices = Math.round(
            (((dCat["best-practices"]?.score ?? 0.5) + (mCat["best-practices"]?.score ?? 0.5)) / 2) * 100
        );
        const seo = Math.round(
            (((dCat.seo?.score ?? 0.5) + (mCat.seo?.score ?? 0.5)) / 2) * 100
        );

        // Custom UX Scores
        const uxScore = Math.round(
            (performance * 0.4) + (accessibility * 0.2) + (bestPractices * 0.2) + (seo * 0.2)
        );
        const conversionScore = Math.round(
            (performance * 0.6) + (bestPractices * 0.4)
        );
        const trustScore = Math.round(
            (bestPractices * 0.6) + (accessibility * 0.4)
        );
        const mobileScore = Math.round(
            (seo * 0.6) + (accessibility * 0.4)
        );

        // Get issues and suggestions
        const auditList = Object.values(audits);
        const issues = auditList
            .filter(a => a.score !== null && a.score < 0.9)
            .slice(0, 5)
            .map(a => a.title);
        const suggestions = auditList
            .filter(a => a.score !== null && a.score < 0.9)
            .slice(0, 5)
            .map(a => a.description);

        // Calculate tokens earned
        const tokensEarned = calculateTokensEarned(uxScore);

        // Save analysis
        const analysis = new Analysis({
            userId,
            url,
            scores: {
                ux: uxScore,
                conversion: conversionScore,
                trust: trustScore,
                mobile: mobileScore,
                performance,
                accessibility,
                bestPractices,
                seo
            },
            issues,
            suggestions,
            pointsEarned: tokensEarned
        });

        await analysis.save();

        // Update user tokens and level
        const user = await User.findById(userId);
        user.tokens += tokensEarned;
        user.level = calculateLevel(user.tokens);
        user.totalAnalyses += 1;
        user.analysisHistory.push(analysis._id);
        await user.save();

        res.json({
            message: "Analysis completed successfully",
            analysis: {
                id: analysis._id,
                scores: analysis.scores,
                issues: analysis.issues,
                suggestions: analysis.suggestions,
                tokensEarned: analysis.pointsEarned
            },
            userStats: {
                tokens: user.tokens,
                level: user.level,
                totalAnalyses: user.totalAnalyses
            }
        });
    } catch (error) {
        console.error("Analysis error:", error.message);
        res.status(500).json({ error: "Failed to analyze website", details: error.message });
    }
};

export const getAnalysisHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const analyses = await Analysis.find({ userId }).sort({ createdAt: -1 }).limit(50);

        res.json({
            analyses: analyses.map(a => ({
                id: a._id,
                url: a.url,
                scores: a.scores,
                tokensEarned: a.pointsEarned,
                createdAt: a.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAnalysisDetail = async (req, res) => {
    try {
        const { analysisId } = req.params;
        const analysis = await Analysis.findById(analysisId);

        if (!analysis) {
            return res.status(404).json({ error: "Analysis not found" });
        }

        res.json({ analysis });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    analyzeWebsite,
    getAnalysisHistory,
    getAnalysisDetail
};
