import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [{
        name: String,
        price: Number,
        quantity: Number
    }],
    totalPrice: { type: Number, required: true },
    tokensUsed: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    finalPrice: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["stripe", "cash", "razorpay", "tokens"], default: "stripe" },
    paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    stripePaymentId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: { type: String, enum: ["pending", "shipped", "delivered", "cancelled"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Order = mongoose.model("Order", orderSchema);
export default Order;
