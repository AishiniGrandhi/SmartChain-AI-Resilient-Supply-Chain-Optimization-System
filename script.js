// 🔐 API KEYS (Recommended to move to .env in production)
const API_KEYS = {
    GEMINI: "AIzaSyDiNT6gNS7sB2427C5lAZWjZhFMNO6OD2k",
    WEATHER: "86b2b836c11b550ab3152451174d3e1b", // OpenWeatherMap
    NEWS: "PASTE_NEWSAPI_KEY"        // NewsAPI.org
};

let activeMap = null;
let mapRoutes = [];
let currentAssets = [...MockAssets];

// ======================
// 📊 UI State Management
// ======================
function initDashboard() {
    const domain = localStorage.getItem('sc_domain') || 'logistics';
    const config = DomainConfig[domain];

    // Render KPIs
    const kpiContainer = document.getElementById('kpi-container');
    if (kpiContainer) {
        kpiContainer.innerHTML = config.kpis.map((kpi, idx) => `
            <div class="kpi-card glass animate-fade-in" style="animation-delay: ${idx * 0.1}s">
                <span class="label">${kpi.label}</span>
                <span class="value">${kpi.value}</span>
                <span class="trend ${kpi.up ? 'up' : 'down'}">
                    <i class="fas fa-caret-${kpi.up ? 'up' : 'down'}"></i> 
                    Updated
                </span>
            </div>
        `).join('');
    }

    // Render Asset List
    const assetList = document.getElementById('asset-list-container') || document.getElementById('route-list-container');
    if (assetList) renderAssetList(assetList);

    initCharts();
    initMap();
    initSuggestedPrompts();

    // Start Real Data Engines
    WeatherEngine.init();
    NewsEngine.init();
    TelemetryEngine.start();
}

function renderAssetList(container) {
    container.innerHTML = currentAssets.map(asset => `
        <div class="glass selectable-asset" onclick="focusAsset('${asset.id}')" id="card-${asset.id}" style="padding: 1.25rem; margin-bottom: 1rem; border-left: 4px solid ${asset.color};">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600; color: var(--text-primary);">${asset.name}</span>
                <span style="font-size: 0.7rem; color: var(--text-secondary); opacity: 0.8;">${asset.id}</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0.5rem 0;">${asset.location}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem;">
                <span class="status-pill" style="border: 1px solid ${asset.status === 'Active' || asset.status === 'Optimized' ? 'var(--success)' : 'var(--warning)'}; color: ${asset.status === 'Active' || asset.status === 'Optimized' ? 'var(--success)' : 'var(--warning)'}">${asset.status.toUpperCase()}</span>
                <span style="font-size: 0.75rem; color: var(--text-secondary);">${asset.eta} • ${asset.dist}</span>
            </div>
        </div>
    `).join('');
}

// ======================
// 🤖 AI Assistant Logic
// ======================
function toggleAI() {
    const panel = document.getElementById('ai-panel');
    if (panel) panel.classList.toggle('active');
}

function initSuggestedPrompts() {
    const container = document.getElementById('suggested-prompts');
    if (!container) return;

    const domain = localStorage.getItem('sc_domain') || 'logistics';
    const prompts = {
        logistics: ["Predict Dallas delays", "Check stock levels"],
        aviation: ["Weather impacts", "Fuel efficiency report"],
        emergency: ["Resource deployment", "Priority incidents"]
    }[domain] || ["Optimize network", "Analyze risk"];

    container.innerHTML = prompts.map(p => `
        <div class="prompt-chip" onclick="quickPrompt('${p}')">${p}</div>
    `).join('');
}

function quickPrompt(text) {
    const input = document.getElementById('userInput');
    if (input) {
        input.value = text;
        getAI();
    }
}

async function getAI() {
    const inputEl = document.getElementById("userInput");
    const chatEl = document.getElementById("chat");
    if (!inputEl || !chatEl || !inputEl.value) return;

    const query = inputEl.value;
    inputEl.value = "";
    addMessage("user", query);

    const loadingMsg = addMessage("ai", "Analyzing operational vectors...");
    showLoading("Consulting Strategic Intelligence Hub...");

    try {
        const domain = localStorage.getItem('sc_domain') || 'logistics';
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEYS.GEMINI}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `You are an expert ${domain} systems analyst. Provide a strategic answer for: ${query}. Max 2 sentences.` }] }]
            })
        });

        const data = await res.json();
        loadingMsg.innerText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Calibration in progress...";
    } catch {
        loadingMsg.innerText = "Demo Mode: AI analysis suggests optimizing Northern Corridor flow for 12% improvement.";
    } finally {
        hideLoading();
    }
    chatEl.scrollTop = chatEl.scrollHeight;
}

// ======================
// 🛰️ Real Data Engines
// ======================
const WeatherEngine = {
    init: async function () {
        if (!API_KEYS.WEATHER || API_KEYS.WEATHER.includes("PASTE")) {
            console.log("Weather: Running in Simulation Mode");
            return;
        }
        try {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=London&appid=${API_KEYS.WEATHER}`);
            const data = await res.json();
            if (data.weather[0].main === "Rain" || data.weather[0].main === "Storm") {
                showToast(`Live Alert: ${data.weather[0].description} detected in London hub.`, "warning");
            }
        } catch (e) { console.error("Weather API Failed", e); }
    }
};

const NewsEngine = {
    init: async function () {
        const alertList = document.getElementById('alert-list-container');
        if (!alertList) return;

        try {
            // Simulated High-Risk News Feed (Logic for Real NewsAPI integration)
            const newsItems = [
                { title: "Port Strike in Rotterdam", risk: "Critical", location: "Europe" },
                { title: "Suez Canal Congestion Update", risk: "High", location: "Global" },
                { title: "Cyber-Attack on Logistics Hub", risk: "Critical", location: "North America" }
            ];

            const newsHtml = newsItems.map(item => `
                <div class="glass" style="padding: 1rem; margin-bottom: 0.75rem; border-left: 3px solid ${item.risk === 'Critical' ? 'var(--danger)' : 'var(--warning)'};">
                    <div style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.25rem;">RISK ZONE: ${item.location}</div>
                    <div style="font-size: 0.85rem; font-weight: 600;">${item.title}</div>
                </div>
            `).join('');

            alertList.insertAdjacentHTML('afterbegin', newsHtml);
        } catch (e) { console.error("News Feed Failed", e); }
    }
};

const TelemetryEngine = {
    start: function () {
        setInterval(() => {
            currentAssets.forEach(asset => {
                // Real GPS Coordinate Simulation (Jittering around real coordinates)
                if (asset.coords && asset.coords.length > 0) {
                    const lastCoord = asset.coords[asset.coords.length - 1];
                    lastCoord[0] += (Math.random() - 0.5) * 0.001;
                    lastCoord[1] += (Math.random() - 0.5) * 0.001;
                }
            });
            // Update UI
            if (document.getElementById('asset-table-body')) renderInventoryTable();
        }, 5000);
    }
};

function addMessage(role, text) {
    const msg = document.createElement("div");
    msg.className = `message ${role} animate-fade-in`;
    msg.innerText = text;
    document.getElementById("chat").appendChild(msg);
    return msg;
}

// ======================
// 🗺️ Map & Interactivity
// ======================
function initMap() {
    const mapEl = document.getElementById("map");
    if (!mapEl) return;

    activeMap = L.map('map', { zoomControl: false, attributionControl: false }).setView([37.0902, -95.7129], 4);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(activeMap);

    // Add Legend
    const legend = document.createElement('div');
    legend.className = 'glass map-legend';
    legend.innerHTML = `
        <h4 style="font-size: 0.8rem; margin-bottom: 0.75rem; color: var(--accent-blue);">NETWORK STATUS</h4>
        <div class="legend-item"><div class="legend-color" style="background: var(--success);"></div> <span>Optimized Path</span></div>
        <div class="legend-item"><div class="legend-color" style="background: #38bdf8;"></div> <span>Active Flow</span></div>
        <div class="legend-item"><div class="legend-color" style="background: var(--warning);"></div> <span>Potential Delay</span></div>
    `;
    mapEl.appendChild(legend);

    currentAssets.forEach(asset => {
        if (!asset.coords) return;

        const polyline = L.polyline(asset.coords, {
            color: asset.color,
            weight: 4,
            opacity: 0.6,
            className: 'interactive-route'
        }).addTo(activeMap);

        // Enhanced Rich Popup
        const popupContent = `
            <div class="glass" style="padding: 1rem; min-width: 200px;">
                <h4 style="color: var(--accent-blue); margin-bottom: 0.5rem;">${asset.name}</h4>
                <div style="font-size: 0.8rem; margin-bottom: 0.25rem;"><b>Contents:</b> High-Value Electronics</div>
                <div style="font-size: 0.8rem; margin-bottom: 0.75rem;"><b>ETA:</b> <span style="color: var(--success);">${asset.eta}</span></div>
                <button class="cta-button" onclick="focusAsset('${asset.id}')" style="width: 100%; font-size: 0.7rem; padding: 6px;">Open Details</button>
            </div>
        `;
        polyline.bindPopup(popupContent, { className: 'custom-popup' });
        polyline.bindTooltip(`<b>${asset.name}</b>`, { sticky: true });

        const movingMarker = L.circleMarker(asset.coords[0], {
            radius: 4,
            color: 'white',
            fillColor: asset.color,
            fillOpacity: 1,
            weight: 2
        }).addTo(activeMap);

        animateMarker(movingMarker, asset.coords);

        polyline.on('click', () => focusAsset(asset.id));
        mapRoutes.push({ id: asset.id, line: polyline, color: asset.color, marker: movingMarker });
    });
}

function animateMarker(marker, path) {
    let i = 0; let progress = 0; const speed = 0.005;
    function move() {
        if (i >= path.length - 1) { i = 0; progress = 0; }
        const start = path[i]; const end = path[i + 1];
        const lat = start[0] + (end[0] - start[0]) * progress;
        const lng = start[1] + (end[1] - start[1]) * progress;
        marker.setLatLng([lat, lng]);
        progress += speed;
        if (progress >= 1) { progress = 0; i++; }
        requestAnimationFrame(move);
    }
    move();
}

function focusAsset(id) {
    document.querySelectorAll('.selectable-asset').forEach(el => el.classList.remove('active'));
    const card = document.getElementById(`card-${id}`);
    if (card) {
        card.classList.add('active');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    mapRoutes.forEach(r => {
        if (r.id === id) {
            r.line.setStyle({ weight: 8, opacity: 1 });
            activeMap.fitBounds(r.line.getBounds(), { padding: [100, 100] });
        } else {
            r.line.setStyle({ weight: 3, opacity: 0.15 });
        }
    });

    const statusEl = document.getElementById('opt-status');
    if (statusEl) {
        const asset = currentAssets.find(a => a.id === id);
        statusEl.innerHTML = `<div style="margin-top: 1rem;">Analyzing <b>${asset.name}</b>. Efficiency: ${asset.stock}. <br> Recommendation: Shift priority to Express Corridor.</div>`;
    }
}

// ======================
// 📦 Inventory Management
// ======================
function renderInventoryTable(data = currentAssets) {
    const tableBody = document.getElementById('asset-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = data.map(asset => `
        <tr class="animate-fade-in">
            <td><code style="color: var(--accent-blue);">${asset.id}</code></td>
            <td style="font-weight: 500;">${asset.name}</td>
            <td style="color: var(--text-secondary);">${asset.location}</td>
            <td>${asset.stock}</td>
            <td><span class="status-pill" style="border: 1px solid ${asset.status === 'Active' || asset.status === 'Optimized' ? 'var(--success)' : 'var(--warning)'}; color: ${asset.status === 'Active' || asset.status === 'Optimized' ? 'var(--success)' : 'var(--warning)'}">${asset.status.toUpperCase()}</span></td>
            <td><button class="cta-button" onclick="focusAsset('${asset.id}')" style="padding: 6px 12px; font-size: 0.75rem;">View</button></td>
        </tr>
    `).join('');
}

function handleSearch() {
    const term = document.getElementById('assetSearch').value.toLowerCase();
    const filtered = currentAssets.filter(a => a.name.toLowerCase().includes(term) || a.id.toLowerCase().includes(term));
    renderInventoryTable(filtered);
}

function openAddModal() {
    const domain = localStorage.getItem('sc_domain') || 'logistics';
    const config = DomainConfig[domain];
    const overlay = document.getElementById('modal-overlay');
    overlay.innerHTML = Components.modal(`Register New ${config.assetName}`, `
        <div class="input-group"><label>Name</label><input type="text" id="new-name"></div>
        <div class="input-group"><label>Location</label><input type="text" id="new-loc"></div>
        <div class="modal-footer">
            <button class="cta-button" onclick="closeModal()">Cancel</button>
            <button class="cta-button glow-blue" onclick="addNewAsset()">Confirm</button>
        </div>
    `);
    overlay.classList.add('active');
}

function closeModal() { document.getElementById('modal-overlay').classList.remove('active'); }

function addNewAsset() {
    const name = document.getElementById('new-name').value;
    const loc = document.getElementById('new-loc').value;
    if (!name || !loc) return showToast("Please fill all fields", "danger");
    currentAssets.push({ id: `ASSET-${Math.floor(Math.random() * 900) + 100}`, name, location: loc, status: "Active", stock: "100%", color: "#38bdf8", eta: "N/A", dist: "N/A" });
    renderInventoryTable(); closeModal(); showToast("Asset registered", "success");
}

function simulateOptimization() {
    showLoading("Generating AI Optimal Trajectory...");
    setTimeout(() => {
        hideLoading();

        // Open Comparison View
        const overlay = document.getElementById('modal-overlay');
        overlay.innerHTML = `
            <div class="glass animate-fade-in" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 800px; padding: 2.5rem; z-index: 2000;">
                <h2 style="margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem;">
                    <i class="fas fa-code-compare" style="color: var(--accent-blue);"></i>
                    Route Optimization Analysis
                </h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div class="glass" style="padding: 1.5rem; border-color: rgba(255,255,255,0.05);">
                        <span class="status-pill" style="background: rgba(255,255,255,0.05); margin-bottom: 1rem;">ORIGINAL ROUTE</span>
                        <h4 style="margin: 1rem 0;">Route Alpha-Standard</h4>
                        <div style="font-size: 0.9rem; color: var(--text-secondary);">
                            <p>Distance: 1,420 km</p>
                            <p>ETA: 18h 45m</p>
                            <p>Risk Score: High (Weather)</p>
                        </div>
                    </div>
                    <div class="glass" style="padding: 1.5rem; border-color: var(--accent-blue);">
                        <span class="status-pill" style="background: rgba(56, 189, 248, 0.2); color: var(--accent-blue); margin-bottom: 1rem;">AI OPTIMIZED</span>
                        <h4 style="margin: 1rem 0;">Route Alpha-Resilient</h4>
                        <div style="font-size: 0.9rem; color: var(--text-secondary);">
                            <p>Distance: 1,310 km</p>
                            <p>ETA: <span style="color: var(--success);">14h 20m</span></p>
                            <p>Risk Score: <span style="color: var(--success);">Low</span></p>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 2.5rem; display: flex; justify-content: flex-end; gap: 1rem;">
                    <button class="cta-button" style="background: transparent; border: 1px solid var(--border);" onclick="closeModal()">Dismiss</button>
                    <button class="cta-button glow-blue" onclick="closeModal(); showToast('Optimization deployed to fleet.', 'success')">Deploy Optimized Route</button>
                </div>
            </div>
        `;
        overlay.classList.add('active');
    }, 1500);
}

// ======================
// 📢 Utilities
// ======================
function showLoading(text) {
    const overlay = document.getElementById('loading-overlay');
    const textEl = document.getElementById('loading-text');
    if (overlay && textEl) { textEl.innerText = text; overlay.classList.add('active'); }
}

function hideLoading() { const overlay = document.getElementById('loading-overlay'); if (overlay) overlay.classList.remove('active'); }

function showToast(msg, type) {
    const container = document.querySelector('.toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.innerHTML = Components.toast(msg, type);
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function initCharts() {
    const el = document.getElementById('chart'); if (!el) return;
    new Chart(el, {
        type: 'line',
        data: { labels: ['00h', '04h', '08h', '12h', '16h', '20h', '24h'], datasets: [{ label: 'Load', data: [30, 45, 60, 90, 75, 50, 40], borderColor: '#38bdf8', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initDashboard();
    if (document.getElementById('asset-table-body')) renderInventoryTable();
});