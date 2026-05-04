const API_BASE = "/api";

const planDetails = {
    monthly: {
        name: "Pro Monthly",
        price: 499,
        tokensNeeded: 4990,
        description: "2000 audits per month"
    },
    yearly: {
        name: "Pro Yearly",
        price: 2999,
        tokensNeeded: 29990,
        description: "Unlimited audits and priority AI analysis"
    }
};

const partnerDetails = {
    shopify: {
        name: "Shopify Store",
        discount: "20%",
        link: "https://shopify.com",
        couponPrefix: "UXSHOP"
    },
    wordpress: {
        name: "WordPress Plugins",
        discount: "15%",
        link: "https://wordpress.org",
        couponPrefix: "UXWP"
    },
    design: {
        name: "Design Tools",
        discount: "25%",
        link: "https://figma.com",
        couponPrefix: "UXDESIGN"
    }
};

// Modal management
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Token modal functions
function showTokenModal(plan) {
    const planInfo = planDetails[plan];
    if (!planInfo) return;

    document.getElementById('token-plan-name').textContent = planInfo.name;
    document.getElementById('token-plan-desc').textContent = planInfo.description;
    document.getElementById('token-plan-price').textContent = planInfo.price;
    document.getElementById('tokens-needed').textContent = planInfo.tokensNeeded;

    // Get user token balance
    const token = localStorage.getItem('token');
    if (token) {
        fetch(`${API_BASE}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            const userTokens = data.user?.tokens || 0;
            document.getElementById('user-token-balance').textContent = userTokens;

            const shortfall = planInfo.tokensNeeded - userTokens;
            if (shortfall > 0) {
                document.getElementById('token-shortfall').style.display = 'block';
                document.getElementById('shortfall-amount').textContent = shortfall;
                document.getElementById('token-purchase-confirm').disabled = true;
            } else {
                document.getElementById('token-shortfall').style.display = 'none';
                document.getElementById('token-purchase-confirm').disabled = false;
            }
        })
        .catch(() => {
            document.getElementById('user-token-balance').textContent = '0';
            document.getElementById('token-shortfall').style.display = 'block';
            document.getElementById('shortfall-amount').textContent = planInfo.tokensNeeded;
            document.getElementById('token-purchase-confirm').disabled = true;
        });
    }

    showModal('token-modal');
}

// Coupon modal functions
function showCouponModal(partner, couponCode) {
    const partnerInfo = partnerDetails[partner];
    if (!partnerInfo) return;

    document.getElementById('generated-coupon').textContent = couponCode;
    document.getElementById('partner-link').href = partnerInfo.link;

    showModal('coupon-modal');
}

// Razorpay plan payment (existing functionality)
async function startPlanPayment(plan, button) {
    if (typeof Razorpay === "undefined") {
        alert("Razorpay checkout is not loaded. Check your internet connection.");
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
        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Payment initialization failed. Check Razorpay credentials.");
            return;
        }

        const checkout = new Razorpay({
            key: data.key,
            amount: data.amount,
            currency: data.currency,
            name: "UX-Ray AI",
            description: planDetails[plan]?.name || "Pro plan",
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
                const verifyData = await verifyResponse.json();
                if (!verifyResponse.ok) {
                    alert(verifyData.error || "Payment verification failed.");
                    return;
                }
                alert("Payment successful! Your plan has been activated.");
                window.location.href = '/dashboard';
            },
            theme: {
                color: "#6366f1"
            }
        });

        checkout.on("payment.failed", function (failure) {
            alert(failure?.error?.description || "Payment failed in Razorpay checkout.");
        });

        checkout.open();
    } catch (error) {
        alert(`Network error: ${error.message}`);
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
}

// Token-based plan purchase
async function purchasePlanWithTokens(plan) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first to purchase with tokens.');
        window.location.href = '/auth';
        return;
    }

    const planInfo = planDetails[plan];
    if (!planInfo) return;

    try {
        const response = await fetch(`${API_BASE}/orders/plans/tokens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ plan })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Token purchase failed.');
            return;
        }

        alert('Plan purchased successfully with tokens!');
        hideModal('token-modal');
        window.location.href = '/dashboard';
    } catch (error) {
        alert(`Network error: ${error.message}`);
    }
}

// Generate partner coupon
async function generatePartnerCoupon(partner) {
    const partnerInfo = partnerDetails[partner];
    if (!partnerInfo) return;

    try {
        const response = await fetch(`${API_BASE}/orders/coupon/${partner}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Failed to generate coupon.');
            return;
        }

        showCouponModal(partner, data.couponCode);
    } catch (error) {
        alert(`Network error: ${error.message}`);
    }
}

// Copy coupon code
function copyCouponCode() {
    const couponCode = document.getElementById('generated-coupon').textContent;
    navigator.clipboard.writeText(couponCode).then(() => {
        const copyBtn = document.getElementById('copy-coupon');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Plan upgrade buttons
    document.querySelectorAll('.plan-upgrade').forEach(button => {
        button.addEventListener('click', function() {
            const plan = this.dataset.plan;
            startPlanPayment(plan, this);
        });
    });

    // Token purchase buttons
    document.querySelectorAll('.token-purchase').forEach(button => {
        button.addEventListener('click', function() {
            const plan = this.dataset.plan;
            showTokenModal(plan);
        });
    });

    // Partner link buttons
    document.querySelectorAll('.partner-link').forEach(button => {
        button.addEventListener('click', function() {
            const partner = this.dataset.partner;
            generatePartnerCoupon(partner);
        });
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            modal.style.display = 'none';
        });
    });

    // Token purchase modal actions
    document.getElementById('token-purchase-confirm')?.addEventListener('click', function() {
        const planName = document.getElementById('token-plan-name').textContent;
        const plan = planName === 'Pro Monthly' ? 'monthly' : 'yearly';
        purchasePlanWithTokens(plan);
    });

    document.getElementById('token-purchase-cancel')?.addEventListener('click', function() {
        hideModal('token-modal');
    });

    // Coupon modal actions
    document.getElementById('copy-coupon')?.addEventListener('click', copyCouponCode);

    document.getElementById('coupon-close')?.addEventListener('click', function() {
        hideModal('coupon-modal');
    });

    // Close modals when clicking outside
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
});