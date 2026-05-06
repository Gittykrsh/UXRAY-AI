import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/helpers.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
    try {
        const { token: idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: "Google token is required" });
        }

        // Verify the token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId, picture } = payload;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if doesn't exist
            // Generate a random password since it's a social login
            const randomPassword = Math.random().toString(36).slice(-10);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = new User({
                name,
                email,
                password: hashedPassword,
                googleId, // Store googleId if your model has it
                picture
            });

            await user.save();
        }

        // Generate our app token
        const token = generateToken(user._id);

        res.json({
            message: "Google login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                tokens: user.tokens,
                level: user.level,
                picture: user.picture
            }
        });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ error: "Google authentication failed" });
    }
};

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                tokens: user.tokens,
                level: user.level
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password required" });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                tokens: user.tokens,
                level: user.level,
                totalAnalyses: user.totalAnalyses
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const logout = (req, res) => {
    res.json({ message: "Logout successful" });
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                tokens: user.tokens,
                level: user.level,
                totalAnalyses: user.totalAnalyses,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    signup,
    login,
    logout,
    getProfile
};
