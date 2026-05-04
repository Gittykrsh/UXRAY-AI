import express from "express";
import * as orderController from "../controllers/orderController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.get("/products", orderController.getProducts);
router.post("/plans/razorpay", orderController.createPlanRazorpayOrder);
router.post("/plans/payment", orderController.verifyPlanRazorpayPayment);
router.post("/plans/tokens", authenticate, orderController.purchasePlanWithTokens);
router.post("/coupon/:partner", orderController.generatePartnerCoupon);
router.post("/create", authenticate, orderController.createOrder);
router.post("/razorpay", authenticate, orderController.createRazorpayOrder);
router.post("/payment", authenticate, orderController.processPayment);
router.get("/my-orders", authenticate, orderController.getOrders);
router.delete("/cancel/:orderId", authenticate, orderController.cancelOrder);

export default router;
