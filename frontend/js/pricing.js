const API_BASE = "http://localhost:5000/api";

const planLabels = {
    monthly: "Pro Monthly",
    yearly: "Pro Yearly"
};

function ensurePlanMessage() {
    let message = document.getElementById("plan-payment-message");
    if (message) return message;

    message = document.createElement("div");
    message.id = "plan-payment-message";
    message.className = "plan-payment-message";
    message.setAttribute("aria-live", "polite");
    document.body.appendChild(message);
    return message;
}

function showPlanMessage(text, type = "error") {
    const message = ensurePlanMessage();
    message.textContent = text;
    message.className = `plan-payment-message is-visible ${type}`;
    window.clearTimeout(showPlanMessage.timeoutId);
    showPlanMessage.timeoutId = window.setTimeout(() => {
        message.classList.remove("is-visible");
    }, 5000);
}

async function readJsonSafe(response) {
    try {
        return await response.json();
    } catch (error) {
        return {};
    }
}

async function startPlanPayment(plan, button) {
    if (typeof Razorpay === "undefined") {
        showPlanMessage("Razorpay checkout is not loaded. Check your internet connection.");
        return;
    }

    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Preparing...";

    try {
        const response = await fetch(`${API_BASE}/orders/plans/razorpay`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan })
        });
        const data = await readJsonSafe(response);

        if (!response.ok) {
            showPlanMessage(data.error || "Payment initialization failed. Check Razorpay credentials.");
            return;
        }

        const checkout = new Razorpay({
            key: data.key,
            amount: data.amount,
            currency: data.currency,
            name: "UX-Ray AI",
            description: planLabels[plan] || "Pro plan",
            order_id: data.id,
            handler: async function (paymentResponse) {
                const verifyResponse = await fetch(`${API_BASE}/orders/plans/payment`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        razorpayPaymentId: paymentResponse.razorpay_payment_id,
                        razorpayOrderId: paymentResponse.razorpay_order_id,
                        razorpaySignature: paymentResponse.razorpay_signature
                    })
                });
                const verifyData = await readJsonSafe(verifyResponse);
                if (!verifyResponse.ok) {
                    showPlanMessage(verifyData.error || "Payment verification failed.");
                    return;
                }
                showPlanMessage("Payment successful. Create/login to activate your plan.", "success");
            },
            theme: {
                color: "#6366f1"
            }
        });

        checkout.on("payment.failed", function (failure) {
            showPlanMessage(failure?.error?.description || "Payment failed in Razorpay checkout.");
        });

        checkout.open();
    } catch (error) {
        showPlanMessage(`Network error: ${error.message}`);
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".plan-upgrade").forEach(button => {
        button.addEventListener("click", () => {
            window.location.href = "/plans";
        });
    });
});
