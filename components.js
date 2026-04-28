const Components = {
    sidebar: (activePage) => {
        const domain = localStorage.getItem('sc_domain') || 'logistics';
        const config = DomainConfig[domain];
        
        return `
            <div class="sidebar">
                <div class="brand">
                    <i class="fas fa-network-wired"></i>
                    <span>Control Tower</span>
                </div>
                <nav>
                    <ul>
                        <li class="${activePage === 'dashboard' ? 'active' : ''}" onclick="window.location.href='dashboard.html'">
                            <i class="fas fa-th-large"></i>
                            <span>Dashboard</span>
                        </li>
                        <li class="${activePage === 'inventory' ? 'active' : ''}" onclick="window.location.href='inventory.html'">
                            <i class="fas fa-boxes"></i>
                            <span>${config.hubName}</span>
                        </li>
                        <li class="${activePage === 'routes' ? 'active' : ''}" onclick="window.location.href='routes.html'">
                            <i class="fas fa-route"></i>
                            <span>Network Optimizer</span>
                        </li>
                        <li class="${activePage === 'alerts' ? 'active' : ''}" onclick="window.location.href='alerts.html'">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>Operations Hub</span>
                        </li>
                    </ul>
                </nav>
                <div class="logged-in-info" style="margin-top: auto; padding-top: 2rem; border-top: 1px solid var(--border);">
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.5rem;">LOGGED IN AS</div>
                    <div style="font-weight: 600; font-size: 0.85rem;">${(localStorage.getItem('sc_role') || 'Manager').toUpperCase()}</div>
                    <div style="font-size: 0.75rem; color: var(--accent-blue); margin-top: 0.25rem; cursor: pointer;" onclick="localStorage.clear(); window.location.href='login.html'">Logout</div>
                </div>
            </div>
        `;
    },
    header: (title) => `
        <header>
            <div style="display:flex; flex-direction:column;">
                <h1 style="font-size: 1.5rem;">${title}</h1>
                <span style="font-size: 0.8rem; color: var(--text-secondary);">Enterprise Multi-Domain Platform</span>
            </div>
            <div class="user-profile">
                <div class="notifications">
                    <i class="fas fa-bell"></i>
                </div>
                <span>Systems Control</span>
                <div class="avatar"></div>
            </div>
        </header>
    `,
    toast: (message, type = 'info') => `
        <div class="toast" style="border-left-color: var(--${type === 'success' ? 'success' : type === 'danger' ? 'danger' : 'accent-blue'})">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}" style="color: var(--${type === 'success' ? 'success' : 'accent-blue'})"></i>
            <span>${message}</span>
        </div>
    `,
    modal: (title, content) => `
        <div class="modal glass">
            <h3>${title}</h3>
            <div style="margin-top: 1.5rem;">${content}</div>
        </div>
    `
};

// Auto-inject components
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!localStorage.getItem('sc_authenticated') && !window.location.href.includes('login.html') && !window.location.href.includes('index.html')) {
        window.location.href = 'login.html';
    }

    const sidebarContainer = document.getElementById('sidebar-container');
    const headerContainer = document.getElementById('header-container');
    
    if (sidebarContainer) {
        sidebarContainer.innerHTML = Components.sidebar(sidebarContainer.dataset.active);
    }
    
    if (headerContainer) {
        const domain = localStorage.getItem('sc_domain') || 'logistics';
        const title = DomainConfig[domain].title;
        headerContainer.innerHTML = Components.header(title);
    }

    // Add Toast Container to body
    if (!document.querySelector('.toast-container')) {
        const tc = document.createElement('div');
        tc.className = 'toast-container';
        document.body.appendChild(tc);
    }
});
