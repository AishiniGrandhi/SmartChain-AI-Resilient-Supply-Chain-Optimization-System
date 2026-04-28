const Components = {
    sidebar: (activePage) => `
        <div class="sidebar">
            <div class="brand">
                <i class="fas fa-network-wired"></i>
                <span>SmartChain AI</span>
            </div>
            <nav>
                <ul>
                    <li class="${activePage === 'dashboard' ? 'active' : ''}" onclick="window.location.href='dashboard.html'">
                        <i class="fas fa-th-large"></i>
                        <span>Dashboard</span>
                    </li>
                    <li class="${activePage === 'inventory' ? 'active' : ''}" onclick="window.location.href='inventory.html'">
                        <i class="fas fa-boxes"></i>
                        <span>Inventory</span>
                    </li>
                    <li class="${activePage === 'routes' ? 'active' : ''}" onclick="window.location.href='routes.html'">
                        <i class="fas fa-route"></i>
                        <span>Route Optimizer</span>
                    </li>
                    <li class="${activePage === 'ai' ? 'active' : ''}" onclick="window.location.href='ai.html'">
                        <i class="fas fa-robot"></i>
                        <span>AI Hub</span>
                    </li>
                    <li class="${activePage === 'alerts' ? 'active' : ''}" onclick="window.location.href='alerts.html'">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Alert Center</span>
                    </li>
                </ul>
            </nav>
        </div>
    `,
    header: (title) => `
        <header>
            <h1>${title}</h1>
            <div class="user-profile">
                <div class="notifications">
                    <i class="fas fa-bell"></i>
                </div>
                <span>Supply Manager</span>
                <div class="avatar"></div>
            </div>
        </header>
    `,
    kpiCard: (label, value, trend, isUp) => `
        <div class="kpi-card glass animate-fade-in">
            <span class="label">${label}</span>
            <span class="value">${value}</span>
            <span class="trend ${isUp ? 'up' : 'down'}">
                <i class="fas fa-caret-${isUp ? 'up' : 'down'}"></i> ${trend}
            </span>
        </div>
    `
};

// Auto-inject components if they exist in the DOM
document.addEventListener('DOMContentLoaded', () => {
    const sidebarContainer = document.getElementById('sidebar-container');
    const headerContainer = document.getElementById('header-container');
    
    if (sidebarContainer) {
        const active = sidebarContainer.dataset.active;
        sidebarContainer.innerHTML = Components.sidebar(active);
    }
    
    if (headerContainer) {
        const title = headerContainer.dataset.title;
        headerContainer.innerHTML = Components.header(title);
    }
});
