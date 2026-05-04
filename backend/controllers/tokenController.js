import User from "../models/User.js";
import { calculateLevel, calculateTokenValue } from "../utils/helpers.js";

export const getUserTokens = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        res.json({
            tokens: user.tokens,
            level: user.level,
            tokenValue: calculateTokenValue(user.tokens),
            nextLevelTokens: (user.level * 100) - user.tokens,
            totalAnalyses: user.totalAnalyses
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const redeemTokens = async (req, res) => {
    try {
        const { tokensToRedeem } = req.body;
        const userId = req.userId;

        if (!tokensToRedeem || tokensToRedeem <= 0) {
            return res.status(400).json({ error: "Invalid token amount" });
        }

        const user = await User.findById(userId);

        if (user.tokens < tokensToRedeem) {
            return res.status(400).json({ error: "Insufficient tokens" });
        }

        const discountValue = calculateTokenValue(tokensToRedeem);

        user.tokens -= tokensToRedeem;
        user.level = calculateLevel(user.tokens);
        await user.save();

        res.json({
            message: "Tokens redeemed successfully",
            discountValue,
            remainingTokens: user.tokens,
            newLevel: user.level
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getLeaderboard = async (req, res) => {
    try {
        const topUsers = await User.find()
            .select("name tokens level totalAnalyses")
            .sort({ tokens: -1 })
            .limit(10);

        res.json({ leaderboard: topUsers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addBonus = async (req, res) => {
    try {
        const { tokensToAdd } = req.body;
        const userId = req.userId;

        const user = await User.findById(userId);
        user.tokens += tokensToAdd;
        user.level = calculateLevel(user.tokens);
        await user.save();

        res.json({
            message: "Bonus tokens added",
            tokens: user.tokens,
            level: user.level
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    getUserTokens,
    redeemTokens,
    getLeaderboard,
    addBonus
};
