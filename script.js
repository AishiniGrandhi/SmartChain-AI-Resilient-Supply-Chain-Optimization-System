// 🔐 API KEY (keep private)
const API_KEY = "PASTE_YOUR_NEW_KEY";

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
                    ${kpi.label.includes('Alert') ? '' : 'Updated'}
                </span>
            </div>
        `).join('');
    }

    // Render Asset List (Dashboard or Routes Page)
    const assetList = document.getElementById('asset-list-container') || document.getElementById('route-list-container');
    if (assetList) {
        renderAssetList(assetList);
    }

    // Initialize Components
    initCharts();
    initMap();
    initSuggestedPrompts();
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
        logistics: ["Predict Dallas delays", "Optimize Route Alpha", "Check stock levels"],
        aviation: ["Weather impacts", "Fuel efficiency report", "Next flight ETA"],
        emergency: ["Resource deployment", "Priority incidents", "Response times"]
    }[domain] || ["Optimize network", "Analyze risk", "Systems status"];

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
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `You are an expert ${domain} systems analyst. Provide a strategic answer for: ${query}. Max 2 sentences.` }] }]
            })
        });

        const data = await res.json();
        loadingMsg.innerText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Calibration in progress...";
    } catch {
        loadingMsg.innerText = "Connection lost. Please check configuration.";
    } finally {
        hideLoading();
    }
    chatEl.scrollTop = chatEl.scrollHeight;
}

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

        // Path Line
        const polyline = L.polyline(asset.coords, { 
            color: asset.color, 
            weight: 4, 
            opacity: 0.6,
            className: 'interactive-route' 
        }).addTo(activeMap);

        // Tooltip
        polyline.bindTooltip(`<b>${asset.name}</b><br>Status: ${asset.status}`, { sticky: true });

        // Animated Flow (Moving Marker)
        const movingMarker = L.circleMarker(asset.coords[0], {
            radius: 4,
            color: 'white',
            fillColor: asset.color,
            fillOpacity: 1,
            weight: 2
        }).addTo(activeMap);

        animateMarker(movingMarker, asset.coords);

        // Interaction
        polyline.on('click', () => focusAsset(asset.id));
        polyline.on('mouseover', () => polyline.setStyle({ opacity: 1, weight: 6 }));
        polyline.on('mouseout', () => {
            const card = document.getElementById(`card-${asset.id}`);
            if (!card || !card.classList.contains('active')) {
                polyline.setStyle({ opacity: 0.6, weight: 4 });
            }
        });

        mapRoutes.push({ id: asset.id, line: polyline, color: asset.color, marker: movingMarker });
    });
}

function animateMarker(marker, path) {
    let i = 0;
    const speed = 0.005; // Progression increment
    let progress = 0;

    function move() {
        if (i >= path.length - 1) {
            i = 0;
            progress = 0;
        }

        const start = path[i];
        const end = path[i + 1];

        const lat = start[0] + (end[0] - start[0]) * progress;
        const lng = start[1] + (end[1] - start[1]) * progress;

        marker.setLatLng([lat, lng]);

        progress += speed;
        if (progress >= 1) {
            progress = 0;
            i++;
        }
        requestAnimationFrame(move);
    }
    move();
}

function focusAsset(id) {
    // UI highlight
    document.querySelectorAll('.selectable-asset').forEach(el => el.classList.remove('active'));
    const card = document.getElementById(`card-${id}`);
    if (card) {
        card.classList.add('active');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Map highlight
    mapRoutes.forEach(r => {
        if (r.id === id) {
            r.line.setStyle({ weight: 8, opacity: 1 });
            activeMap.fitBounds(r.line.getBounds(), { padding: [100, 100] });
        } else {
            r.line.setStyle({ weight: 3, opacity: 0.15 });
        }
    });

    // Sidebar Data Sync
    const statusEl = document.getElementById('opt-status');
    if (statusEl) {
        const asset = currentAssets.find(a => a.id === id);
        statusEl.innerHTML = `
            <div style="margin-top: 1rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Efficiency</span>
                    <span style="color: var(--accent-blue);">${asset.stock}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                    <span>ETA Impact</span>
                    <span style="color: var(--success);">-12%</span>
                </div>
                <p style="font-size: 0.8rem; color: var(--text-secondary);">
                    Strategic recommendation: Shift priority to Express Corridor via Bypass Node ${id.split('-')[1]}.
                </p>
            </div>
        `;
    }
}

// ======================
// 📦 Functional Features (Inventory)
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
            <td>
                <button class="cta-button" onclick="focusAsset('${asset.id}')" style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.2); color: var(--accent-blue); padding: 6px 12px; font-size: 0.75rem;">View Assets</button>
            </td>
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
        <div class="input-group">
            <label>Asset Name</label>
            <input type="text" id="new-name" placeholder="e.g. Flight 702 / Route Delta">
        </div>
        <div class="input-group">
            <label>Current Hub / Location</label>
            <input type="text" id="new-loc" placeholder="Primary Terminal A">
        </div>
        <div class="modal-grid">
            <div class="input-group">
                <label>Initial Capacity</label>
                <input type="text" id="new-stock" placeholder="85%">
            </div>
            <div class="input-group">
                <label>Operational Priority</label>
                <select id="new-status">
                    <option value="Active">Standard Priority</option>
                    <option value="Optimized">High Priority</option>
                    <option value="Delayed">Critical/Emergency</option>
                </select>
            </div>
        </div>
        <div class="modal-footer">
            <button class="cta-button" style="background: transparent; border: 1px solid var(--border); color: white;" onclick="closeModal()">Cancel</button>
            <button class="cta-button glow-blue" onclick="addNewAsset()">Confirm Registration</button>
        </div>
    `);
    overlay.classList.add('active');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}

function addNewAsset() {
    const name = document.getElementById('new-name').value;
    const loc = document.getElementById('new-loc').value;
    const stock = document.getElementById('new-stock').value;
    const status = document.getElementById('new-status').value;

    if (!name || !loc) return showToast("Please fill all fields", "danger");

    const newAsset = {
        id: `ASSET-${Math.floor(Math.random() * 900) + 100}`,
        name: name,
        location: loc,
        status: status,
        stock: stock,
        color: "#818cf8",
        eta: "N/A",
        dist: "N/A"
    };

    currentAssets.push(newAsset);
    renderInventoryTable();
    closeModal();
    showToast(`New ${newAsset.id} added successfully`, "success");
}

// ======================
// ⚡ Optimization Simulation
// ======================
function simulateOptimization() {
    const btn = event.target;
    const originalText = btn.innerText;
    
    showLoading("Re-calculating Operational Network Topology...");
    btn.disabled = true;
    
    setTimeout(() => {
        btn.disabled = false;
        btn.innerText = originalText;
        hideLoading();
        showToast("Strategic optimization applied. Network efficiency +14%", "success");
        
        // Update a random asset
        const target = currentAssets[Math.floor(Math.random() * currentAssets.length)];
        target.status = "Optimized";
        target.stock = "98%";
        
        const assetList = document.getElementById('asset-list-container') || document.getElementById('route-list-container');
        if (assetList) renderAssetList(assetList);
        if (document.getElementById('asset-table-body')) renderInventoryTable();
        
        const statusEl = document.getElementById('opt-status');
        if (statusEl) statusEl.innerHTML = `Optimization complete. ETA reduced by <b>22 minutes</b>.`;
    }, 2500);
}

// ======================
// 📢 Utilities
// ======================
function showLoading(text) {
    const overlay = document.getElementById('loading-overlay');
    const textEl = document.getElementById('loading-text');
    if (overlay && textEl) {
        textEl.innerText = text;
        overlay.classList.add('active');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.remove('active');
}

function showToast(msg, type) {
    const container = document.querySelector('.toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.innerHTML = Components.toast(msg, type);
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function initCharts() {
    const el = document.getElementById('chart');
    if (!el) return;
    new Chart(el, {
        type: 'line',
        data: {
            labels: ['00h', '04h', '08h', '12h', '16h', '20h', '24h'],
            datasets: [{
                label: 'System Load',
                data: [30, 45, 60, 90, 75, 50, 40],
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } }
        }
    });
}

// ======================
// 🚀 Entry Point
// ======================
document.addEventListener("DOMContentLoaded", () => {
    initDashboard();
    if (document.getElementById('asset-table-body')) renderInventoryTable();
});