import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key-change-in-prod", {
        expiresIn: "7d"
    });
};

export const calculateLevel = (tokens) => {
    // Level increases every 100 tokens
    return Math.floor(tokens / 100) + 1;
};

export const calculateTokensEarned = (uxScore) => {
    // Higher UX scores earn more tokens
    return Math.round(uxScore / 10) || 1;
};

export const calculateTokenValue = (tokens) => {
    // Each token = $0.10 in discount
    return tokens * 0.1;
};

export default {
    generateToken,
    calculateLevel,
    calculateTokensEarned,
    calculateTokenValue
};
