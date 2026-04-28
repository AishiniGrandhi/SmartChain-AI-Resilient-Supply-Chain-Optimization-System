// components.js
function renderSidebar() {
    const user = typeof getUser === 'function' ? getUser() : JSON.parse(localStorage.getItem('smartchain_user') || '{}');
    if (!user || !user.email) return;

    const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
    
    const sidebarHTML = `
    <aside class="sidebar">
        <div class="sidebar-header">
            <h2 class="text-gradient" style="font-size: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-network-wired"></i> SmartChain
            </h2>
        </div>
        
        <nav class="sidebar-nav">
            <a href="dashboard.html" class="nav-item ${currentPath === 'dashboard.html' ? 'active' : ''}">
                <i class="fas fa-chart-pie"></i> Dashboard
            </a>
            ${(user.role === 'Admin' || user.role === 'Logistics Manager') ? `
            <a href="inventory.html" class="nav-item ${currentPath === 'inventory.html' ? 'active' : ''}">
                <i class="fas fa-boxes-stacked"></i> Inventory
            </a>
            ` : ''}
            <a href="routes.html" class="nav-item ${currentPath === 'routes.html' ? 'active' : ''}">
                <i class="fas fa-route"></i> Route Optimization
            </a>
            ${(user.role === 'Admin' || user.role === 'Logistics Manager') ? `
            <a href="alerts.html" class="nav-item ${currentPath === 'alerts.html' ? 'active' : ''}">
                <i class="fas fa-bell"></i> Alerts & Risks
            </a>
            ` : ''}
            <a href="tracking.html" class="nav-item ${currentPath === 'tracking.html' ? 'active' : ''}">
                <i class="fas fa-location-crosshairs"></i> Order Tracking
            </a>
            ${(user.role === 'Admin' || user.role === 'Logistics Manager') ? `
            <a href="ai.html" class="nav-item ${currentPath === 'ai.html' ? 'active' : ''}">
                <i class="fas fa-brain"></i> AI Decision Engine
            </a>
            ` : ''}
        </nav>

        <div class="sidebar-footer">
            <div class="user-info">
                <div class="user-avatar">${user.email.charAt(0).toUpperCase()}</div>
                <div class="user-details">
                    <span class="user-name">${user.role}</span>
                    <span class="user-role">${user.transportType} Sector</span>
                </div>
            </div>
            <button class="btn logout-btn" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>
    </aside>
    `;

    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
}

document.addEventListener('DOMContentLoaded', renderSidebar);
