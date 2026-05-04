import express from "express";
import cors from "cors";
import "dotenv/config";
import { fileURLToPath } from 'url';
import path from "path";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import tokenRoutes from "./routes/tokenRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import Product from "./models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pagesPath = path.resolve(__dirname, "..", "frontend", "pages");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Connect to MongoDB
await connectDB();

// Initialize sample products if none exist
const productCount = await Product.countDocuments();
if (productCount === 0) {
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
    console.log("Sample products created");
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/orders", orderRoutes);

// Serve HTML files
app.get("/", (req, res) => {
    const filePath = path.resolve(pagesPath, "index.html");
    console.log('Serving index file:', filePath);
    res.sendFile(filePath);
});
app.get("/auth", (req, res) => {
    const filePath = path.resolve(pagesPath, "auth.html");
    console.log('Serving auth file:', filePath);
    res.sendFile(filePath);
});
app.get("/dashboard", (req, res) => {
    const filePath = path.resolve(pagesPath, "dashboard.html");
    console.log('Serving dashboard file:', filePath);
    res.sendFile(filePath);
});
app.get("/plans", (req, res) => {
    const filePath = path.resolve(pagesPath, "plans.html");
    console.log('Serving plans file:', filePath);
    res.sendFile(filePath);
});

// Optional aliases for old page-style links
app.get("/auth.html", (req, res) => {
    const filePath = path.resolve(pagesPath, "auth.html");
    console.log('Serving auth alias file:', filePath);
    res.sendFile(filePath);
});
app.get("/dashboard.html", (req, res) => {
    const filePath = path.resolve(pagesPath, "dashboard.html");
    console.log('Serving dashboard alias file:', filePath);
    res.sendFile(filePath);
});
app.get("/plans.html", (req, res) => {
    const filePath = path.resolve(pagesPath, "plans.html");
    console.log('Serving plans alias file:', filePath);
    res.sendFile(filePath);
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal server error", message: err.message });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Analysis API: POST http://localhost:${PORT}/api/analysis/analyze`);
    console.log(`🔐 Auth API: POST http://localhost:${PORT}/api/auth/signup`);
});
