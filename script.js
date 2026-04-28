// script.js
let userConfig = null;
let currentUser = null;

function initApp() {
    currentUser = typeof getUser === 'function' ? getUser() : null;
    if (!currentUser) return;
    
    userConfig = typeof getTransportConfig === 'function' ? getTransportConfig(currentUser.transportType) : null;
    
    // Update Dashboard UI elements based on transport config
    const badge = document.getElementById('dashboard-transport-badge');
    if (badge && userConfig) {
        badge.innerHTML = `${userConfig.icon} ${userConfig.label}`;
    }

    if (currentUser.role === 'Driver') {
        // Hide advanced metrics from Driver
        const dashboardLayouts = document.querySelectorAll('.dashboard-layout');
        dashboardLayouts.forEach(el => el.style.display = 'none');
        
        // Hide the active alerts KPI card (4th card)
        const kpiCards = document.querySelectorAll('.kpi-card');
        if (kpiCards.length >= 4) {
            kpiCards[3].style.display = 'none';
        }
    }

    const kpi1Label = document.getElementById('kpi-1-label');
    const kpi1Icon = document.getElementById('kpi-1-icon');
    const kpi3Label = document.getElementById('kpi-3-label');

    if (kpi1Label && userConfig) kpi1Label.innerText = userConfig.kpi1Label;
    if (kpi1Icon && userConfig) {
        kpi1Icon.className = `fas ${userConfig.kpi1Icon}`;
    }
    if (kpi3Label && userConfig) kpi3Label.innerText = userConfig.kpi3Label;

    // Init components
    if (document.getElementById('demandChart')) initDemandChart();
    if (document.getElementById('inventory-chart')) initInventoryChart();
    if (document.getElementById('mini-map')) initMiniMap();
    if (document.getElementById('full-map')) initFullMap();
    
    if (document.getElementById('dashboard-alerts')) generateMockAlerts('dashboard-alerts');
    if (document.getElementById('alerts-feed')) generateMockAlerts('alerts-feed', 10);
}

// ======================
// 📊 Charts
// ======================
function initDemandChart() {
    const ctx = document.getElementById('demandChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
            datasets: [{
                label: 'Actual Capacity Usage',
                data: [45, 52, 85, 92, 78, 65, 40],
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                fill: true,
                tension: 0.4
            }, {
                label: 'AI Predicted Demand',
                data: [42, 55, 80, 95, 75, 60, 45],
                borderColor: '#818cf8',
                borderDash: [5, 5],
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#94a3b8' } }
            },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

function initInventoryChart() {
    const ctx = document.getElementById('inventory-chart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['In Transit', 'Main Hub', 'Regional A', 'Regional B'],
            datasets: [{
                data: [450, 1200, 300, 800],
                backgroundColor: ['#38bdf8', '#818cf8', '#f59e0b', '#10b981'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { color: '#94a3b8' } }
            }
        }
    });
}

// ======================
// 🗺️ Leaflet Maps
// ======================
const mapStyles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

function initMiniMap() {
    const center = userConfig ? userConfig.mapCenter : [37.0902, -95.7129];
    const map = L.map('mini-map', { zoomControl: false, attributionControl: false }).setView(center, 4);
    L.tileLayer(mapStyles, { maxZoom: 19 }).addTo(map);
    setTimeout(() => { map.invalidateSize(); }, 500);

    // Add some random markers depending on transport type
    const offset = 5;
    for(let i=0; i<3; i++) {
        const lat = center[0] + (Math.random() * offset * 2 - offset);
        const lng = center[1] + (Math.random() * offset * 2 - offset);
        L.circleMarker([lat, lng], { radius: 6, color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: 0.8 }).addTo(map);
    }
}

function initFullMap() {
    const center = userConfig ? userConfig.mapCenter : [37.0902, -95.7129];
    const map = L.map('full-map', { zoomControl: true, attributionControl: false }).setView(center, 5);
    L.tileLayer(mapStyles, { maxZoom: 19 }).addTo(map);

    // Fix map rendering in flex containers
    setTimeout(() => { map.invalidateSize(); }, 500);

    const latOffset = 2;
    const lngOffset = 5;
    
    // Main Route
    const route = [
        [center[0] - latOffset, center[1] - lngOffset],
        [center[0], center[1]],
        [center[0] + latOffset, center[1] + lngOffset]
    ];

    // Alternate AI Route
    const altRoute = [
        [center[0] - latOffset, center[1] - lngOffset],
        [center[0] + latOffset*0.5, center[1] - lngOffset*0.2],
        [center[0] + latOffset, center[1] + lngOffset]
    ];

    L.polyline(route, { color: '#38bdf8', weight: 4, opacity: 0.8 }).addTo(map);
    L.polyline(altRoute, { color: '#ef4444', weight: 3, opacity: 0.6, dashArray: '10, 10' }).addTo(map);

    // Animated Vehicle
    const vehicleIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style='background: var(--success); width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 0 15px var(--success); display:flex; align-items:center; justify-content:center; color:white; font-size: 8px;'><i class="fas ${userConfig ? userConfig.kpi1Icon : 'fa-truck'}"></i></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });

    let marker = L.marker(route[0], { icon: vehicleIcon }).addTo(map);
    let i = 0;
    setInterval(() => {
        i = (i + 1) % route.length;
        marker.setLatLng(route[i]);
    }, 4000);
}

// ======================
// 🚨 Alerts Simulation
// ======================
function generateMockAlerts(containerId, count = 3) {
    const container = document.getElementById(containerId);
    if (!container || !userConfig) return;
    
    container.innerHTML = '';
    const types = userConfig.alertTypes;

    for (let i = 0; i < count; i++) {
        const isCritical = Math.random() > 0.6;
        const type = types[Math.floor(Math.random() * types.length)];
        const timeOffset = Math.floor(Math.random() * 60);
        
        const alertHTML = `
        <div class="alert-item ${isCritical ? 'critical' : 'warning'}">
            <div class="alert-icon">
                <i class="fas ${isCritical ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}"></i>
            </div>
            <div class="alert-content">
                <h4>${isCritical ? 'Critical Issue' : 'Warning'}: ${type}</h4>
                <p>AI detected anomaly on route sector ${Math.floor(Math.random()*100)}A.</p>
                <span class="alert-time">${timeOffset} mins ago</span>
            </div>
        </div>
        `;
        container.insertAdjacentHTML('beforeend', alertHTML);
    }
}

// ======================
// 🤖 AI Integration (Gemini)
// ======================
async function askAI() {
    const inputEl = document.getElementById("ai-input");
    const chatEl = document.getElementById("ai-chat-messages");
    if (!inputEl || !chatEl || !inputEl.value.trim() || !currentUser) return;

    const query = inputEl.value;
    inputEl.value = "";

    // Add user message
    const userMsg = `<div class="message user fade-in">${query}</div>`;
    chatEl.insertAdjacentHTML('beforeend', userMsg);
    chatEl.scrollTop = chatEl.scrollHeight;

    // Add loading
    const loadingId = 'loading-' + Date.now();
    const loadingMsg = `<div id="${loadingId}" class="message ai fade-in">Analyzing ${currentUser.transportType} network...</div>`;
    chatEl.insertAdjacentHTML('beforeend', loadingMsg);
    chatEl.scrollTop = chatEl.scrollHeight;

    try {
        const promptContext = `You are a supply chain AI. Based on transport type (${currentUser.transportType}) and role (${currentUser.role}), give an optimized solution for: ${query}`;
        
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${currentUser.apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptContext }] }]
                })
            }
        );

        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate a response at this time.";
        
        document.getElementById(loadingId).innerText = reply;
    } catch (err) {
        document.getElementById(loadingId).innerHTML = `<span style="color:var(--danger)"><i class="fas fa-times-circle"></i> Connection failed. Please check your API key in settings or relogin.</span>`;
    }
    chatEl.scrollTop = chatEl.scrollHeight;
}

// Tracking logic for tracking.html
function searchOrder() {
    const val = document.getElementById('orderId').value;
    if(!val) return;

    const statusContainer = document.getElementById('tracking-result');
    statusContainer.classList.add('active');

    // Simulate completion
    setTimeout(() => {
        document.getElementById('step-transit').classList.add('completed');
        document.getElementById('step-transit').classList.remove('active');
        
        document.getElementById('step-delivered').classList.add('active');
        document.getElementById('status-icon-main').className = 'fas fa-box-open status-icon';
        document.getElementById('status-text-main').innerText = 'Out for Delivery';
    }, 2000);
}

document.addEventListener("DOMContentLoaded", initApp);