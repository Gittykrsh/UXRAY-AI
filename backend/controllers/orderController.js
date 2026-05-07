import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { calculateTokenValue } from "../utils/helpers.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy");

function getRazorpayCredentials() {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_SECRET?.trim();

    if (!keyId || !keySecret) {
        throw new Error("Razorpay credentials are missing in .env");
    }

    return { keyId, keySecret };
}

function getRazorpayClient() {
    const { keyId, keySecret } = getRazorpayCredentials();
    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret
    });
}

function getPaymentErrorMessage(error) {
    return error?.error?.description || error?.description || error?.message || "Payment provider request failed";
}

const pricingPlans = {
    monthly: {
        name: "Pro Monthly",
        amount: 499,
        tokensRequired: 4990,
        description: "2000 audits and downloadable reports"
    },
    yearly: {
        name: "Pro Yearly",
        amount: 2999,
        tokensRequired: 29990,
        description: "Unlimited audits and priority AI analysis"
    }
};

const partnerCoupons = {
    shopify: {
        name: "Shopify Store",
        discount: "20%",
        prefix: "UXSHOP"
    },
    wordpress: {
        name: "WordPress Plugins",
        discount: "15%",
        prefix: "UXWP"
    },
    design: {
        name: "Design Tools",
        discount: "25%",
        prefix: "UXDESIGN"
    },
    aesivo: {
        name: "AESIVO",
        discount: "10%",
        prefix: "AESIVO10"
    }
};

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find().limit(20);
        res.json({ products });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createOrder = async (req, res) => {
    try {
        const { items, tokensToUse } = req.body;
        const userId = req.userId;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "No items in order" });
        }

        // Verify products and calculate total
        let totalPrice = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ error: `Product ${item.productId} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }

            totalPrice += product.price * item.quantity;
            orderItems.push({
                name: product.name,
                price: product.price,
                quantity: item.quantity
            });
        }

        // Apply token discount
        let discountAmount = 0;
        if (tokensToUse) {
            const user = await User.findById(userId);
            if (user.tokens < tokensToUse) {
                return res.status(400).json({ error: "Insufficient tokens" });
            }
            discountAmount = calculateTokenValue(tokensToUse);
            if (discountAmount > totalPrice) {
                discountAmount = totalPrice; // Can't discount more than total
            }
        }

        const finalPrice = totalPrice - discountAmount;

        // Create order
        const order = new Order({
            userId,
            items: orderItems,
            totalPrice,
            tokensUsed: tokensToUse || 0,
            discountAmount,
            finalPrice,
            paymentStatus: "pending"
        });

        await order.save();

        res.status(201).json({
            message: "Order created successfully",
            order: {
                id: order._id,
                totalPrice,
                discountAmount,
                finalPrice,
                paymentStatus: order.paymentStatus
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createRazorpayOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.userId;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        if (order.userId.toString() !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        if (order.finalPrice <= 0) {
            return res.status(400).json({ error: "No payment required" });
        }

        const amount = Math.round(order.finalPrice * 100);
        const { keyId } = getRazorpayCredentials();
        const razorpay = getRazorpayClient();
        const razorpayOrder = await razorpay.orders.create({
            amount,
            currency: "INR",
            receipt: `order_${order._id}`,
            payment_capture: 1
        });

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        res.json({
            key: keyId,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            id: razorpayOrder.id,
            orderId: order._id
        });
    } catch (error) {
        console.error("Razorpay order creation error:", getPaymentErrorMessage(error));
        res.status(500).json({ error: getPaymentErrorMessage(error) });
    }
};

export const createPlanRazorpayOrder = async (req, res) => {
    try {
        const { plan } = req.body;
        const selectedPlan = pricingPlans[plan];

        if (!selectedPlan) {
            return res.status(400).json({ error: "Invalid pricing plan" });
        }

        const { keyId } = getRazorpayCredentials();
        const razorpay = getRazorpayClient();
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(selectedPlan.amount * 100),
            currency: "INR",
            receipt: `plan_${plan}_${Date.now()}`,
            notes: {
                plan,
                planName: selectedPlan.name
            },
            payment_capture: 1
        });

        res.json({
            key: keyId,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            id: razorpayOrder.id,
            plan: {
                id: plan,
                ...selectedPlan
            }
        });
    } catch (error) {
        console.error("Razorpay plan order creation error:", getPaymentErrorMessage(error));
        res.status(500).json({ error: getPaymentErrorMessage(error) });
    }
};

export const verifyPlanRazorpayPayment = async (req, res) => {
    try {
        const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

        if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
            return res.status(400).json({ error: "Missing Razorpay payment details" });
        }

        const { keySecret } = getRazorpayCredentials();
        const generatedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex");

        if (generatedSignature !== razorpaySignature) {
            return res.status(400).json({ error: "Payment verification failed" });
        }

        res.json({ message: "Plan payment verified successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const processPayment = async (req, res) => {
    try {
        const { orderId, paymentMethodId, paymentMethod, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
        const userId = req.userId;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        if (order.userId.toString() !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        if (paymentMethod === "cash") {
            order.paymentStatus = "completed";
            order.paymentMethod = "cash";
        } else if (paymentMethod === "tokens") {
            order.paymentStatus = "completed";
            order.paymentMethod = "tokens";
        } else if (paymentMethod === "razorpay") {
            if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
                return res.status(400).json({ error: "Missing Razorpay payment details" });
            }

            const { keySecret } = getRazorpayCredentials();
            const generatedSignature = crypto
                .createHmac("sha256", keySecret)
                .update(`${razorpayOrderId}|${razorpayPaymentId}`)
                .digest("hex");

            if (generatedSignature !== razorpaySignature) {
                return res.status(400).json({ error: "Payment verification failed" });
            }

            order.paymentStatus = "completed";
            order.paymentMethod = "razorpay";
            order.razorpayPaymentId = razorpayPaymentId;
            order.razorpayOrderId = razorpayOrderId;
            order.razorpaySignature = razorpaySignature;
        } else if (paymentMethod === "stripe" || paymentMethodId) {
            order.paymentStatus = "completed";
            order.paymentMethod = "stripe";
            order.stripePaymentId = "pi_" + Math.random().toString(36).substring(7);
        } else {
            return res.status(400).json({ error: "Invalid payment method" });
        }

        if (order.tokensUsed > 0) {
            const user = await User.findById(userId);
            user.tokens -= order.tokensUsed;
            await user.save();
        }

        for (const item of order.items) {
            await Product.updateOne(
                { name: item.name },
                { $inc: { stock: -item.quantity } }
            );
        }

        order.status = "shipped";
        order.updatedAt = Date.now();
        await order.save();

        res.json({
            message: "Payment processed successfully",
            order: {
                id: order._id,
                status: order.status,
                paymentStatus: order.paymentStatus,
                finalPrice: order.finalPrice
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });

        res.json({
            orders: orders.map(o => ({
                id: o._id,
                items: o.items,
                totalPrice: o.totalPrice,
                finalPrice: o.finalPrice,
                discountAmount: o.discountAmount,
                status: o.status,
                paymentStatus: o.paymentStatus,
                createdAt: o.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.userId;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        if (order.userId.toString() !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        if (order.status === "delivered" || order.status === "cancelled") {
            return res.status(400).json({ error: "Cannot cancel this order" });
        }

        // Restore tokens if used
        if (order.tokensUsed > 0) {
            const user = await User.findById(userId);
            user.tokens += order.tokensUsed;
            await user.save();
        }

        order.status = "cancelled";
        order.paymentStatus = "failed";
        await order.save();

        res.json({ message: "Order cancelled successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const purchasePlanWithTokens = async (req, res) => {
    try {
        const { plan } = req.body;
        const userId = req.userId;

        const selectedPlan = pricingPlans[plan];
        if (!selectedPlan) {
            return res.status(400).json({ error: "Invalid pricing plan" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.tokens < selectedPlan.tokensRequired) {
            return res.status(400).json({
                error: `Insufficient tokens. Required: ${selectedPlan.tokensRequired}, Available: ${user.tokens}`
            });
        }

        // Deduct tokens
        user.tokens -= selectedPlan.tokensRequired;
        await user.save();

        // Create order record for tracking
        const order = new Order({
            userId,
            items: [{
                name: selectedPlan.name,
                price: selectedPlan.amount,
                quantity: 1
            }],
            totalPrice: selectedPlan.amount,
            tokensUsed: selectedPlan.tokensRequired,
            discountAmount: selectedPlan.amount,
            finalPrice: 0,
            paymentStatus: "completed",
            paymentMethod: "tokens",
            status: "completed"
        });

        await order.save();

        res.json({
            message: "Plan purchased successfully with tokens",
            plan: selectedPlan,
            remainingTokens: user.tokens
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const generatePartnerCoupon = async (req, res) => {
    try {
        const { partner } = req.params;

        const partnerInfo = partnerCoupons[partner];
        if (!partnerInfo) {
            return res.status(400).json({ error: "Invalid partner" });
        }

        // Generate unique coupon code
        let couponCode;
        if (partner === 'aesivo') {
            couponCode = partnerInfo.prefix;
        } else {
            const timestamp = Date.now().toString().slice(-4);
            const random = Math.random().toString(36).substring(2, 5).toUpperCase();
            couponCode = `${partnerInfo.prefix}${timestamp}${random}`;
        }

        res.json({
            couponCode,
            partner: partnerInfo.name,
            discount: partnerInfo.discount,
            message: `Use code ${couponCode} for ${partnerInfo.discount} off at ${partnerInfo.name}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    getProducts,
    createOrder,
    createRazorpayOrder,
    createPlanRazorpayOrder,
    verifyPlanRazorpayPayment,
    processPayment,
    purchasePlanWithTokens,
    generatePartnerCoupon,
    getOrders,
    cancelOrder
};
