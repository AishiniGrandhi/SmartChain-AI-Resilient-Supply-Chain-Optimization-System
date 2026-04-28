// auth.js
function getUser() {
    const user = localStorage.getItem('smartchain_user');
    if (!user) {
        if(window.location.pathname.split('/').pop() !== 'index.html' && window.location.pathname.split('/').pop() !== '') {
            window.location.href = 'index.html';
        }
        return null;
    }
    return JSON.parse(user);
}

function logout() {
    localStorage.removeItem('smartchain_user');
    window.location.href = 'index.html';
}

function checkAccess() {
    const user = getUser();
    if (!user) return; 

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPath === 'index.html' || currentPath === '') return;

    const role = user.role;

    // Define allowed pages per role
    const permissions = {
        'Admin': ['dashboard.html', 'inventory.html', 'routes.html', 'alerts.html', 'tracking.html', 'ai.html'],
        'Logistics Manager': ['dashboard.html', 'inventory.html', 'routes.html', 'alerts.html', 'tracking.html', 'ai.html'],
        'Driver': ['dashboard.html', 'routes.html', 'tracking.html']
    };

    // Redirect if role is not recognized or page not allowed
    if (!permissions[role] || !permissions[role].includes(currentPath)) {
        window.location.href = 'dashboard.html';
    }
}

// Automatically check access on script load for protected pages
checkAccess();

function getTransportConfig(transportType) {
    const configs = {
        'Railways': {
            icon: '🚆',
            label: 'Railways Network',
            kpi1Label: 'Active Trains',
            kpi1Icon: 'fa-train',
            kpi3Label: 'On-Time Stations',
            mapCenter: [20.5937, 78.9629], // India
            alertTypes: ['Track Maintenance', 'Signal Failure', 'Station Overcrowding']
        },
        'Airways': {
            icon: '✈️',
            label: 'Airways Network',
            kpi1Label: 'Active Flights',
            kpi1Icon: 'fa-plane',
            kpi3Label: 'Airport Clearance',
            mapCenter: [51.5074, -0.1278], // London
            alertTypes: ['Weather Delay', 'Airspace Congestion', 'Runway Maintenance']
        },
        'Roadways': {
            icon: '🚌',
            label: 'Roadways Network',
            kpi1Label: 'Active Trucks',
            kpi1Icon: 'fa-truck',
            kpi3Label: 'Route Optimization',
            mapCenter: [37.0902, -95.7129], // US
            alertTypes: ['Heavy Traffic', 'Highway Accident', 'Vehicle Breakdown']
        }
    };
    return configs[transportType] || configs['Roadways'];
}
