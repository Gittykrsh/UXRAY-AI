/* ========================= */
/*     UX-RAY DASHBOARD       */
/* ========================= */

const API_BASE = "/api";

/* ========================= */
/*     IN-PAGE TOAST         */
/* ========================= */
function showToast(message, type) {
    type = type || "info";
    var container = document.getElementById("ux-toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "ux-toast-container";
        container.style.cssText = "position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;align-items:center;gap:10px;pointer-events:none;width:min(460px,90vw)";
        document.body.appendChild(container);
    }
    if (!document.getElementById("ux-toast-style")) {
        var st = document.createElement("style");
        st.id = "ux-toast-style";
        st.textContent = "@keyframes toastIn{from{opacity:0;transform:translateY(-18px) scale(0.9)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes toastOut{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(-10px) scale(0.95)}}";
        document.head.appendChild(st);
    }
    var icons   = {success:"\u2705",error:"\u274c",info:"\u2139\ufe0f",warning:"\u26a0\ufe0f"};
    var bgs     = {success:"rgba(16,72,38,.97)",error:"rgba(90,16,16,.97)",info:"rgba(17,10,48,.97)",warning:"rgba(70,50,0,.97)"};
    var borders = {success:"rgba(74,222,128,.5)",error:"rgba(248,113,113,.5)",info:"rgba(139,92,246,.6)",warning:"rgba(250,204,21,.5)"};
    var colors  = {success:"#bbf7d0",error:"#fecaca",info:"#e9d5ff",warning:"#fef08a"};
    var t = document.createElement("div");
    t.style.cssText = "background:"+bgs[type]+";border:1px solid "+borders[type]+";color:"+colors[type]+";padding:14px 20px;border-radius:14px;font-family:'Poppins',sans-serif;font-size:14px;font-weight:600;backdrop-filter:blur(14px);box-shadow:0 20px 50px rgba(0,0,0,.45);display:flex;align-items:center;gap:10px;width:100%;pointer-events:all;cursor:pointer;animation:toastIn .35s cubic-bezier(.34,1.56,.64,1) forwards";
    t.innerHTML = "<span style='font-size:18px'>"+(icons[type]||icons.info)+"</span><span>"+message+"</span>";
    container.appendChild(t);
    var dismiss = function(){t.style.animation="toastOut .28s ease forwards";setTimeout(function(){t.remove();},280);};
    t.addEventListener("click",dismiss);
    setTimeout(dismiss,4500);
}


document.addEventListener("DOMContentLoaded", function () {

    /* ========================= */
    /*     ELEMENT SELECTORS     */
    /* ========================= */

    const analyzeBtn = document.getElementById("analyze-btn");
    const resultsSection = document.getElementById("results-section");
    const uxScore = document.getElementById("ux-score");
    const conversionScore = document.getElementById("conversion-score");
    const trustScore = document.getElementById("trust-score");
    const mobileScore = document.getElementById("mobile-score");
    const issuesList = document.getElementById("issues-list");
    const suggestionsList = document.getElementById("suggestions-list");
    const websiteInput = document.getElementById("website-url");
    const pointsDisplay = document.getElementById("points-display");
    const levelDisplay = document.getElementById("level-display");
    const logoutBtn = document.getElementById("logout-btn");
    const downloadBtn = document.getElementById("download-report");
    const resetBtn = document.getElementById("reset-analysis");
    const aiLoader = document.getElementById("ai-loader");
    const reportHistory = document.getElementById("report-history");
    const chartCanvas = document.getElementById("uxChart");
    const productGrid = document.getElementById("product-grid");
    const shopTokens = document.getElementById("shop-tokens");
    const applyEditor = document.getElementById("apply-editor");
    const previewFrame = document.getElementById("preview-frame");

    let currentUser = null;
    let currentAnalysis = null;
    let uxChart = null;
    let selectedShopProduct = null;
    let shopProducts = [];

    console.log("Dashboard loaded successfully");

    /* ========================= */
    /*     DROPDOWN SYSTEM       */
    /* ========================= */

    function setupDropdown(id) {
        const dropdown = document.getElementById(id);
        if (!dropdown) {
            console.warn(`Dropdown ${id} not found`);
            return;
        }

        const selected = dropdown.querySelector(".dropdown-selected");
        const options = dropdown.querySelector(".dropdown-options");

        if (!selected || !options) {
            console.warn(`Dropdown elements missing for ${id}`);
            return;
        }

        selected.addEventListener("click", (e) => {
            e.stopPropagation();
            document.querySelectorAll(".dropdown-options").forEach(opt => {
                if (opt !== options) opt.style.display = "none";
            });
            options.style.display = options.style.display === "block" ? "none" : "block";
        });

        options.querySelectorAll("div").forEach(option => {
            option.addEventListener("click", () => {
                selected.innerText = option.innerText;
                selected.dataset.value = option.dataset.value;
                options.style.display = "none";

                if (id === "lang-dropdown") {
                    updateLanguage(option.dataset.value);
                }
            });
        });
    }

    document.addEventListener("click", () => {
        document.querySelectorAll(".dropdown-options").forEach(opt => {
            opt.style.display = "none";
        });
    });

    function getSelectedValue(id) {
        const el = document.querySelector(`#${id} .dropdown-selected`);
        return el?.dataset.value || "";
    }

    function updateLanguage(lang) {
        localStorage.setItem("uxLang", lang);
        const translations = {
            en: { analyze: "Analyze with AI", placeholder: "Enter website URL..." },
            hi: { analyze: "AI se Analyze karo", placeholder: "Website URL daalo..." }
        };
        const t = translations[lang] || translations.en;
        if (analyzeBtn) analyzeBtn.innerText = t.analyze;
        if (websiteInput) websiteInput.placeholder = t.placeholder;
    }

    setupDropdown("audience-dropdown");
    setupDropdown("goal-dropdown");
    setupDropdown("lang-dropdown");

    const savedLang = localStorage.getItem("uxLang") || "en";
    updateLanguage(savedLang);

    /* ========================= */
    /*     AUTH SYSTEM           */
    /* ========================= */

    function checkAuth() {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "auth.html";
            return false;
        }
        currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        return true;
    }

    function getHeaders() {
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        };
    }

    async function updateUserProfile() {
        try {
            const response = await fetch(`${API_BASE}/auth/profile`, { headers: getHeaders() });
            const data = await response.json();
            if (response.ok && data.user) {
                currentUser = data.user;
                localStorage.setItem("user", JSON.stringify(currentUser));
                updatePointsDisplay();
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    }

    const isAuth = checkAuth();

    /* ========================= */
    /*     POINT SYSTEM          */
    /* ========================= */

    function updatePointsDisplay() {
        if (isAuth && currentUser) {
            if (pointsDisplay) pointsDisplay.innerText = `Tokens: ${currentUser.tokens || 0}`;
            if (levelDisplay) levelDisplay.innerText = `Level: ${currentUser.level || 1}`;
            renderShopTokens();
        }
    }

    function renderShopTokens() {
        if (shopTokens && currentUser) {
            shopTokens.innerText = currentUser.tokens || 0;
        }
    }

    function ensurePurchaseModal() {
        let modal = document.getElementById("purchase-modal");
        if (modal) return modal;

        modal = document.createElement("div");
        modal.id = "purchase-modal";
        modal.className = "purchase-modal";
        modal.setAttribute("aria-hidden", "true");
        modal.innerHTML = `
            <div class="purchase-backdrop" data-close-purchase></div>
            <div class="purchase-dialog" role="dialog" aria-modal="true" aria-labelledby="purchase-title">
                <button class="purchase-close" type="button" aria-label="Close" data-close-purchase>&times;</button>
                <div class="purchase-kicker">Rewards checkout</div>
                <h3 id="purchase-title">Complete purchase</h3>
                <p id="purchase-description" class="purchase-description"></p>
                <div class="purchase-summary">
                    <span>Plan price</span>
                    <strong id="purchase-unit-price">Rs.0.00</strong>
                    <span>Your tokens</span>
                    <strong id="purchase-token-balance">0</strong>
                </div>
                <label class="purchase-field">
                    <span>Quantity</span>
                    <input id="purchase-quantity" type="number" min="1" value="1">
                </label>
                <label class="purchase-field">
                    <span>Use tokens</span>
                    <input id="purchase-tokens" type="number" min="0" value="0">
                </label>
                <div class="token-slider-row">
                    <input id="purchase-token-slider" type="range" min="0" value="0">
                    <button id="purchase-max-tokens" type="button">Max</button>
                </div>
                <div class="purchase-total">
                    <span>Estimated discount</span>
                    <strong id="purchase-discount">Rs.0.00</strong>
                    <span>Estimated payable</span>
                    <strong id="purchase-payable">Rs.0.00</strong>
                </div>
                <div id="purchase-message" class="purchase-message" aria-live="polite"></div>
                <div class="purchase-actions">
                    <button type="button" class="purchase-secondary" data-close-purchase>Cancel</button>
                    <button type="button" id="purchase-confirm" class="purchase-primary">Continue to Pay</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelectorAll("[data-close-purchase]").forEach(element => {
            element.addEventListener("click", closePurchaseModal);
        });
        modal.querySelector("#purchase-quantity").addEventListener("input", updatePurchaseEstimate);
        modal.querySelector("#purchase-tokens").addEventListener("input", updatePurchaseEstimate);
        modal.querySelector("#purchase-token-slider").addEventListener("input", syncTokenSlider);
        modal.querySelector("#purchase-max-tokens").addEventListener("click", useMaxTokens);
        modal.querySelector("#purchase-confirm").addEventListener("click", submitPurchaseFromModal);

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && modal.classList.contains("is-open")) closePurchaseModal();
        });

        return modal;
    }

    function formatCurrency(value) {
        return `Rs.${Number(value || 0).toFixed(2)}`;
    }

    async function readJsonSafe(response) {
        try {
            return await response.json();
        } catch (error) {
            return {};
        }
    }

    function parseApiError(data, fallback) {
        return data?.error || data?.message || fallback;
    }

    function getPurchaseElements() {
        const modal = ensurePurchaseModal();
        return {
            modal,
            title: modal.querySelector("#purchase-title"),
            description: modal.querySelector("#purchase-description"),
            unitPrice: modal.querySelector("#purchase-unit-price"),
            tokenBalance: modal.querySelector("#purchase-token-balance"),
            quantity: modal.querySelector("#purchase-quantity"),
            tokens: modal.querySelector("#purchase-tokens"),
            tokenSlider: modal.querySelector("#purchase-token-slider"),
            maxTokens: modal.querySelector("#purchase-max-tokens"),
            discount: modal.querySelector("#purchase-discount"),
            payable: modal.querySelector("#purchase-payable"),
            message: modal.querySelector("#purchase-message"),
            confirm: modal.querySelector("#purchase-confirm")
        };
    }

    function showPurchaseMessage(message, type = "error") {
        const { message: messageElement } = getPurchaseElements();
        messageElement.textContent = message || "";
        messageElement.className = `purchase-message ${message ? "is-visible" : ""} ${type}`;
    }

    function openPurchaseModal(product) {
        selectedShopProduct = product;
        const elements = getPurchaseElements();
        const availableTokens = currentUser?.tokens || 0;

        elements.title.textContent = product.name;
        elements.description.textContent = product.description || "Apply earned tokens before payment.";
        elements.unitPrice.textContent = formatCurrency(product.price);
        elements.tokenBalance.textContent = availableTokens;
        elements.quantity.value = 1;
        elements.tokens.value = 0;
        elements.tokens.max = availableTokens;
        elements.tokenSlider.max = availableTokens;
        elements.tokenSlider.value = 0;
        elements.confirm.disabled = false;
        elements.confirm.textContent = "Continue to Pay";
        showPurchaseMessage("");
        updatePurchaseEstimate();

        elements.modal.classList.add("is-open");
        elements.modal.setAttribute("aria-hidden", "false");
        setTimeout(() => elements.quantity.focus(), 50);
    }

    function closePurchaseModal() {
        const modal = document.getElementById("purchase-modal");
        if (!modal) return;
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        selectedShopProduct = null;
    }

    function normalizePurchaseInputs() {
        const elements = getPurchaseElements();
        const availableTokens = currentUser?.tokens || 0;
        const quantity = Math.max(1, Number.parseInt(elements.quantity.value, 10) || 1);
        const subtotal = (selectedShopProduct?.price || 0) * quantity;
        const maxUsefulTokens = Math.min(availableTokens, Math.ceil(subtotal * 10));
        const tokensToUse = Math.min(maxUsefulTokens, Math.max(0, Number.parseInt(elements.tokens.value, 10) || 0));

        elements.quantity.value = quantity;
        elements.tokens.max = maxUsefulTokens;
        elements.tokenSlider.max = maxUsefulTokens;
        elements.tokens.value = tokensToUse;
        elements.tokenSlider.value = tokensToUse;

        return { quantity, tokensToUse, subtotal, maxUsefulTokens };
    }

    function updatePurchaseEstimate() {
        if (!selectedShopProduct) return;
        const elements = getPurchaseElements();
        const { tokensToUse, subtotal, maxUsefulTokens } = normalizePurchaseInputs();
        const discount = Math.min(tokensToUse * 0.1, subtotal);
        const payable = Math.max(0, subtotal - discount);

        elements.discount.textContent = formatCurrency(discount);
        elements.payable.textContent = formatCurrency(payable);
        elements.maxTokens.disabled = maxUsefulTokens === 0;
        elements.confirm.textContent = payable <= 0 ? "Complete with Tokens" : "Continue to Pay";
    }

    function syncTokenSlider() {
        const elements = getPurchaseElements();
        elements.tokens.value = elements.tokenSlider.value;
        updatePurchaseEstimate();
    }

    function useMaxTokens() {
        const elements = getPurchaseElements();
        elements.tokens.value = elements.tokens.max || 0;
        updatePurchaseEstimate();
    }

    async function loadShopProducts() {
        if (!productGrid) return;

        try {
            const response = await fetch(`${API_BASE}/orders/products`);
            const data = await response.json();
            const products = data.products || [];
            shopProducts = products;

            productGrid.innerHTML = "";
            if (products.length === 0) {
                productGrid.innerHTML = "<p style='opacity:0.7'>No shop plans available yet.</p>";
                return;
            }

            products.forEach(product => {
                const card = document.createElement("div");
                card.className = "product-card";
                card.innerHTML = `
                    <h4 style="color: #f8fafc; font-weight: 600; font-size: 16px; margin-bottom: 8px;">${product.name}</h4>
                    <p style="color: #94a3b8; font-size: 13px; margin-bottom: 16px; line-height: 1.5;">${product.description}</p>
                    <span style="display: block; font-size: 14px; color: #cbd5e1; margin-bottom: 6px;">Price: <strong style="color: #4ade80;">₹${product.price.toFixed(2)}</strong></span>
                    <span style="display: block; font-size: 13px; color: #64748b; margin-bottom: 18px;">Stock: <strong style="color: #a78bfa;">${product.stock}</strong></span>
                    <button class="buy-button" data-id="${product._id}" data-price="${product.price}">Buy Plan</button>
                `;
                productGrid.appendChild(card);
            });

            productGrid.querySelectorAll(".buy-button").forEach(button => {
                button.addEventListener("click", handleProductPurchase);
            });
        } catch (error) {
            console.error("Failed to load shop products:", error);
        }
    }

    async function handleProductPurchase(event) {
        const button = event.currentTarget;
        const productId = button.dataset.id;
        const productPrice = Number(button.dataset.price);
        const product = shopProducts.find(item => item._id === productId) || {
            _id: productId,
            name: "Selected plan",
            description: "Apply earned tokens before payment.",
            price: productPrice
        };
        openPurchaseModal(product);
        return;
        const quantity = 1;

        if (quantity < 1) {
            showToast("Please enter a valid quantity", "warning");
            return;
        }

        const availableTokens = currentUser?.tokens || 0;
        let tokensToUse = 0;
        if (tokensToUse < 0) tokensToUse = 0;
        if (tokensToUse > availableTokens) {
            showToast("You don\u0027t have enough tokens", "warning");
            return;
        }

        const createResponse = await fetch(`${API_BASE}/orders/create`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                items: [{ productId, quantity }],
                tokensToUse
            })
        });
        const createData = await createResponse.json();

        if (!createResponse.ok) {
            showToast("Order creation failed: " + (createData.error || "Unknown error"), "error");
            return;
        }

        const order = createData.order;

        if (order.finalPrice <= 0) {
            const paymentResponse = await fetch(`${API_BASE}/orders/payment`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    orderId: order.id,
                    paymentMethod: "tokens"
                })
            });
            const paymentData = await paymentResponse.json();
            if (!paymentResponse.ok) {
                showToast("Payment failed: " + (paymentData.error || "Unknown error"), "error");
                return;
            }
            await updateUserProfile();
            showToast("Purchase complete with tokens!", "success");
            return;
        }

        const razorpayResponse = await fetch(`${API_BASE}/orders/razorpay`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ orderId: order.id })
        });
        const razorpayData = await razorpayResponse.json();

        if (!razorpayResponse.ok) {
            showToast("Payment initialization failed: " + (razorpayData.error || "Unknown error"), "error");
            return;
        }

        openRazorpayCheckout(razorpayData, order.id);
    }

    async function submitPurchaseFromModal() {
        if (!selectedShopProduct) return;

        const elements = getPurchaseElements();
        const { quantity, tokensToUse } = normalizePurchaseInputs();

        elements.confirm.disabled = true;
        elements.confirm.textContent = "Preparing payment...";
        showPurchaseMessage("");

        const createResponse = await fetch(`${API_BASE}/orders/create`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                items: [{ productId: selectedShopProduct._id, quantity }],
                tokensToUse
            })
        });
        const createData = await readJsonSafe(createResponse);

        if (!createResponse.ok) {
            showPurchaseMessage(parseApiError(createData, "Order creation failed."));
            elements.confirm.disabled = false;
            updatePurchaseEstimate();
            return;
        }

        const order = createData.order;

        if (order.finalPrice <= 0) {
            const paymentResponse = await fetch(`${API_BASE}/orders/payment`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    orderId: order.id,
                    paymentMethod: "tokens"
                })
            });
            const paymentData = await readJsonSafe(paymentResponse);

            if (!paymentResponse.ok) {
                showPurchaseMessage(parseApiError(paymentData, "Token payment failed."));
                elements.confirm.disabled = false;
                updatePurchaseEstimate();
                return;
            }

            await updateUserProfile();
            showPurchaseMessage("Purchase complete with tokens.", "success");
            setTimeout(closePurchaseModal, 1100);
            return;
        }

        const razorpayResponse = await fetch(`${API_BASE}/orders/razorpay`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ orderId: order.id })
        });
        const razorpayData = await readJsonSafe(razorpayResponse);

        if (!razorpayResponse.ok) {
            showPurchaseMessage(parseApiError(razorpayData, "Payment initialization failed. Check Razorpay credentials."));
            elements.confirm.disabled = false;
            updatePurchaseEstimate();
            return;
        }

        openRazorpayCheckout(razorpayData, order.id);
    }

    function openRazorpayCheckout(orderData, orderId) {
        if (typeof Razorpay === "undefined") {
            showPurchaseMessage("Razorpay checkout is not loaded. Check your internet connection and script access.");
            const { confirm } = getPurchaseElements();
            confirm.disabled = false;
            updatePurchaseEstimate();
            return;
        }

        const options = {
            key: orderData.key,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "UX-Ray AI",
            description: "Shop purchase",
            order_id: orderData.id,
            handler: async function (response) {
                const paymentResponse = await fetch(`${API_BASE}/orders/payment`, {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        orderId,
                        paymentMethod: "razorpay",
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpayOrderId: response.razorpay_order_id,
                        razorpaySignature: response.razorpay_signature
                    })
                });
                const paymentData = await paymentResponse.json();
                if (!paymentResponse.ok) {
                    showPurchaseMessage(`Payment verification failed: ${paymentData.error || "Unknown error"}`);
                    return;
                }
                await updateUserProfile();
                showPurchaseMessage("Payment successful and order completed.", "success");
                setTimeout(closePurchaseModal, 1100);
            },
            prefill: {
                email: currentUser?.email || ""
            },
            theme: {
                color: "#6366f1"
            }
        };

        const rzp = new Razorpay(options);
        rzp.on("payment.failed", function (response) {
            showPurchaseMessage(response?.error?.description || "Payment failed in Razorpay checkout.");
            const { confirm } = getPurchaseElements();
            confirm.disabled = false;
            updatePurchaseEstimate();
        });
        rzp.open();
    }

    updatePointsDisplay();
    renderShopTokens();
    loadShopProducts();

    /* ========================= */
    /*     CHART SYSTEM          */
    /* ========================= */

    function initChart() {
        if (!chartCanvas || typeof Chart === "undefined") {
            console.warn("Chart.js not loaded or canvas not found");
            return;
        }

        const scoreHistory = JSON.parse(localStorage.getItem("uxScoreHistory")) || [];
        uxChart = new Chart(chartCanvas, {
            type: "line",
            data: {
                labels: scoreHistory.map((_, i) => `Attempt ${i + 1}`),
                datasets: [{
                    label: "UX Score",
                    data: scoreHistory,
                    borderColor: "#6366f1",
                    backgroundColor: "rgba(99,102,241,0.15)",
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: '#cbd5f5' } } },
                scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { min: 0, max: 100, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
            }
        });
    }

    function updateChart(score) {
        if (!uxChart) {
            initChart();
        }
        if (uxChart) {
            uxChart.data.labels.push(`Attempt ${uxChart.data.labels.length + 1}`);
            uxChart.data.datasets[0].data.push(score);
            uxChart.update();
        }
    }

    initChart();

    /* ========================= */
    /*     REPORT HISTORY        */
    /* ========================= */

    function renderReportHistory() {
        if (!reportHistory) return;

        const reports = JSON.parse(localStorage.getItem("uxReports")) || [];
        reportHistory.innerHTML = "";

        if (reports.length === 0) {
            reportHistory.innerHTML = "<p style='opacity:0.6'>No reports yet</p>";
            return;
        }

        reports.slice().reverse().forEach(report => {
            const div = document.createElement("div");
            div.style.padding = "10px";
            div.style.marginBottom = "10px";
            div.style.borderRadius = "8px";
            div.style.background = "rgba(255,255,255,0.05)";
            div.style.fontSize = "14px";
            div.innerHTML = `<strong>${report.url}</strong><br>UX Score: <span style="color:#6366f1">${report.score}</span>`;
            reportHistory.appendChild(div);
        });
    }

    renderReportHistory();

    /* ========================= */
    /*     SCORE ANIMATION       */
    /* ========================= */

    function animateScore(element, value) {
        if (!element) return;

        let start = 0;
        const duration = 800;
        const startTime = performance.now();

        function update(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const currentValue = Math.floor(progress * value);
            element.innerText = currentValue;
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.innerText = value;
            }
        }

        requestAnimationFrame(update);
    }

    /* ========================= */
    /*     ANALYZE FUNCTION      */
    /* ========================= */

    if (analyzeBtn) {
        console.log("Setting up analyze button");
        analyzeBtn.addEventListener("click", async () => {
            console.log("Analyze button clicked");

            const url = websiteInput?.value?.trim();
            if (!url) {
                showToast("Please enter a website URL", "error");
                return;
            }

            analyzeBtn.disabled = true;
            analyzeBtn.innerText = "🔄 Analyzing...";
            if (aiLoader) aiLoader.style.display = "block";

            try {
                const response = await fetch(`${API_BASE}/analysis/analyze`, {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({ url })
                });

                const result = await response.json();

                if (!response.ok) {
                    showToast(result.error || "Analysis failed", "error");
                    console.error("API Error:", result);
                    return;
                }

                if (!result.analysis || !result.analysis.scores) {
                    showToast("Invalid response from server", "error");
                    return;
                }

                const data = result.analysis;

                animateScore(uxScore, data.scores.ux);
                animateScore(conversionScore, data.scores.conversion);
                animateScore(trustScore, data.scores.trust);
                animateScore(mobileScore, data.scores.mobile);

                if (issuesList) issuesList.innerHTML = "";
                if (suggestionsList) suggestionsList.innerHTML = "";

                data.issues?.forEach(issue => {
                    const li = document.createElement("li");
                    li.innerText = issue;
                    issuesList.appendChild(li);
                });

                data.suggestions?.forEach(suggestion => {
                    const li = document.createElement("li");
                    li.innerText = suggestion;
                    suggestionsList.appendChild(li);
                });

                if (resultsSection) resultsSection.style.display = "block";

                updateChart(data.scores.ux);
                await updateUserProfile();
                currentAnalysis = data;

                showToast("Analysis Complete! You earned " + (data.tokensEarned || 0) + " tokens!", "success");

            } catch (error) {
                console.error("Analysis Error:", error);
                showToast("Network error: " + error.message, "error");
            } finally {
                analyzeBtn.disabled = false;
                analyzeBtn.innerText = "Analyze with AI";
                if (aiLoader) aiLoader.style.display = "none";
            }
        });
    }

    /* ========================= */
    /*     DOWNLOAD REPORT       */
    /* ========================= */

    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            if (!currentAnalysis) {
                showToast("Run an analysis first to download a report", "warning");
                return;
            }

            const url = websiteInput?.value || "N/A";
            const scores = currentAnalysis.scores || {};
            const issues = currentAnalysis.issues || [];
            const suggestions = currentAnalysis.suggestions || [];

            const report = `
UX ANALYSIS REPORT
==================

Website: ${url}

SCORES:
- UX Score: ${scores.ux ?? "N/A"}
- Conversion Score: ${scores.conversion ?? "N/A"}
- Trust Score: ${scores.trust ?? "N/A"}
- Mobile Score: ${scores.mobile ?? "N/A"}

ISSUES:
${issues.length ? issues.join("\n") : "No issues detected"}

SUGGESTIONS:
${suggestions.length ? suggestions.join("\n") : "No suggestions available"}

Generated by UX-Ray AI
`;

            const blob = new Blob([report], { type: "text/plain" });
            const urlBlob = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = urlBlob;
            a.download = "ux-report.txt";
            a.click();
        });
    }

    /* ========================= */
    /*     RESET ANALYSIS        */
    /* ========================= */

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (issuesList) issuesList.innerHTML = "";
            if (suggestionsList) suggestionsList.innerHTML = "";
            if (resultsSection) resultsSection.style.display = "none";
            if (websiteInput) websiteInput.value = "";
            currentAnalysis = null;
            if (aiLoader) aiLoader.style.display = "none";
            analyzeBtn.innerText = "Analyze with AI";
            analyzeBtn.disabled = false;
        });
    }

    /* ========================= */
    /*     LIVE EDITOR           */
    /* ========================= */

    if (applyEditor && previewFrame) {
        applyEditor.addEventListener("click", () => {
            const htmlEditor = document.getElementById("html-editor");
            const cssEditor = document.getElementById("css-editor");

            if (!htmlEditor || !cssEditor) {
                console.warn("Editor elements missing");
                return;
            }

            const html = htmlEditor.value.trim();
            const css = cssEditor.value.trim();

            if (!html && !css) {
                showToast("Please enter HTML or CSS to preview", "warning");
                return;
            }

            const content = `
                <html>
                <head><style>${css}</style></head>
                <body>${html}</body>
                </html>
            `;

            previewFrame.srcdoc = content;
            applyEditor.innerText = "Applied ✔";
            setTimeout(() => {
                applyEditor.innerText = "Run ▶";
            }, 1200);
        });
    }

    /* ========================= */
    /*     LOGOUT                */
    /* ========================= */

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await fetch(`${API_BASE}/auth/logout`, {
                    method: "POST",
                    headers: getHeaders()
                });
            } catch (err) {
                console.warn("Logout API failed");
            }

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "auth.html";
        });
    }

    console.log("Dashboard initialization complete");
});
