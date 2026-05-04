import mongoose from "mongoose";
import User from "./models/User.js";
import Product from "./models/Product.js";
import dotenv from 'dotenv';
dotenv.config();

console.log("MONGO_URI:", process.env.MONGO_URI);
const initDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/uxrayai");
        console.log("✅ Connected to MongoDB");

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        console.log("🗑️  Cleared existing data");

        // Create sample users
        const sampleUsers = [
            { name: "Alice Johnson", email: "alice@example.com", password: "hashed_pass_alice", tokens: 500, level: 5 },
            { name: "Bob Smith", email: "bob@example.com", password: "hashed_pass_bob", tokens: 350, level: 3 },
            { name: "Carol White", email: "carol@example.com", password: "hashed_pass_carol", tokens: 700, level: 7 },
            { name: "David Brown", email: "david@example.com", password: "hashed_pass_david", tokens: 200, level: 2 }
        ];

        await User.insertMany(sampleUsers);
        console.log("👥 Created sample users");

        // Create sample products
        const sampleProducts = [
            { name: "Premium Analysis Report", description: "Detailed UX report with recommendations", price: 29.99, category: "reports", stock: 100 },
            { name: "SEO Optimization Guide", description: "Complete guide to improve SEO", price: 19.99, category: "guides", stock: 100 },
            { name: "Performance Boost Package", description: "Website speed optimization", price: 39.99, category: "services", stock: 100 },
            { name: "Accessibility Audit", description: "WCAG compliance check", price: 49.99, category: "audits", stock: 100 },
            { name: "Mobile Optimization", description: "Responsive design consultation", price: 24.99, category: "services", stock: 100 },
            { name: "Security Enhancement", description: "Website security audit", price: 34.99, category: "services", stock: 100 },
            { name: "Content Analysis Tool", description: "AI-powered content review", price: 14.99, category: "tools", stock: 100 },
            { name: "Conversion Rate Optimization", description: "CRO strategy and implementation", price: 59.99, category: "services", stock: 100 }
        ];

        await Product.insertMany(sampleProducts);
        console.log("🛍️  Created sample products");

        console.log("\n✅ Database initialized successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error initializing database:", error);
        process.exit(1);
    }
};

initDatabase();
