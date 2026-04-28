// 🔐 API KEY (keep private)
const API_KEY = "PASTE_YOUR_NEW_KEY";

// ======================
// 📊 Charts Initialization
// ======================
function initCharts() {
    const chartEl = document.getElementById("chart");
    if (chartEl) {
        new Chart(chartEl, {
            type: "line",
            data: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [{
                    label: "Actual Demand",
                    data: [65, 59, 80, 81, 56, 55, 40],
                    borderColor: "#38bdf8",
                    backgroundColor: "rgba(56, 189, 248, 0.1)",
                    fill: true,
                    tension: 0.4
                }, {
                    label: "Predicted Demand",
                    data: [60, 62, 75, 85, 60, 58, 45],
                    borderColor: "#818cf8",
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#94a3b8', font: { family: 'Inter' } }
                    }
                },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }

    const invChartEl = document.getElementById("inventory-chart");
    if (invChartEl) {
        new Chart(invChartEl, {
            type: "doughnut",
            data: {
                labels: ["In Transit", "Warehouse A", "Warehouse B", "Warehouse C"],
                datasets: [{
                    data: [300, 450, 120, 2400],
                    backgroundColor: ["#38bdf8", "#818cf8", "#facc15", "#22c55e"],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: '#94a3b8', font: { family: 'Inter' } }
                    }
                }
            }
        });
    }
}

// ======================
// 🗺️ Map Initialization
// ======================
function initMap() {
    const mapEl = document.getElementById("map");
    if (!mapEl) return;

    const map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([37.0902, -95.7129], 4); // US Center

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(map);

    // Dynamic Route Example
    const route = [
        [32.7767, -96.7970], // Dallas
        [35.4676, -97.5164], // Oklahoma City
        [39.1031, -94.5812], // Kansas City
        [41.8781, -87.6298]  // Chicago
    ];

    const polyline = L.polyline(route, {
        color: '#38bdf8',
        weight: 3,
        opacity: 0.6,
        dashArray: '10, 10',
        lineCap: 'round'
    }).addTo(map);

    // Animated "Truck" Marker
    const truckIcon = L.divIcon({
        className: 'custom-div-icon',
        html: "<div style='background: var(--accent-blue); width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 10px var(--accent-blue);'></div>",
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });

    let marker = L.marker(route[0], { icon: truckIcon }).addTo(map);
    let i = 0;

    setInterval(() => {
        i = (i + 1) % route.length;
        marker.setLatLng(route[i]);
    }, 3000);
}

// ======================
// 🤖 AI Decision Engine
// ======================
async function getAI() {
    const inputEl = document.getElementById("userInput");
    const chatEl = document.getElementById("chat");

    if (!inputEl || !chatEl || !inputEl.value) return;

    const query = inputEl.value;
    inputEl.value = "";

    // Add user message
    const userMsg = document.createElement("div");
    userMsg.className = "message user animate-fade-in";
    userMsg.innerText = query;
    chatEl.appendChild(userMsg);
    chatEl.scrollTop = chatEl.scrollHeight;

    // Loading indicator
    const loadingMsg = document.createElement("div");
    loadingMsg.className = "message ai animate-fade-in";
    loadingMsg.innerText = "Analyzing network patterns...";
    chatEl.appendChild(loadingMsg);

    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are a professional supply chain AI consultant. Provide a high-level strategic answer for: ${query}. Keep it concise (max 3 sentences).`
                        }]
                    }]
                })
            }
        );

        const data = await res.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm currently recalibrating my models. Please try again in a moment.";

        loadingMsg.innerText = reply;
    } catch (err) {
        loadingMsg.innerText = "Connection lost. Please check your network and API configuration.";
        loadingMsg.style.color = "var(--danger)";
    }
    chatEl.scrollTop = chatEl.scrollHeight;
}

// ======================
// 🚀 Lifecycle
// ======================
document.addEventListener("DOMContentLoaded", () => {
    initCharts();
    initMap();
});