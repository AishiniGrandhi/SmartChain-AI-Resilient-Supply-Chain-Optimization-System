const DomainConfig = {
    logistics: {
        title: "Supply Chain Control Tower",
        assetName: "Shipments",
        hubName: "Warehouses",
        kpis: [
            { label: "Active Shipments", value: "1,284", trend: "12.5%", up: true },
            { label: "On-Time Delivery", value: "94.2%", up: true },
            { label: "Inventory Health", value: "88.5%", up: true },
            { label: "Disruptions", value: "3", up: false }
        ]
    },
    transport: {
        title: "Metropolitan Transit Hub",
        assetName: "Vehicles",
        hubName: "Stations",
        kpis: [
            { label: "Active Buses/Trains", value: "412", up: true },
            { label: "Schedule Adherence", value: "91.8%", up: false },
            { label: "Passenger Load", value: "76%", up: true },
            { label: "Network Alerts", value: "5", up: false }
        ]
    },
    aviation: {
        title: "Air Traffic Operations",
        assetName: "Flights",
        hubName: "Airports",
        kpis: [
            { label: "Airborne Flights", value: "85", up: true },
            { label: "Departure Precision", value: "89.4%", up: true },
            { label: "Fuel Efficiency", value: "92.1%", up: true },
            { label: "Weather Diverts", value: "2", up: false }
        ]
    },
    maritime: {
        title: "Global Maritime Network",
        assetName: "Vessels",
        hubName: "Ports",
        kpis: [
            { label: "Vessels at Sea", value: "214", up: true },
            { label: "Port Congestion", value: "Low", up: true },
            { label: "Fuel Optimization", value: "84.2%", up: true },
            { label: "Piracy Risk", value: "Zero", up: true }
        ]
    },
    emergency: {
        title: "Emergency Response Command",
        assetName: "Units",
        hubName: "Command Centers",
        kpis: [
            { label: "Active Incidents", value: "14", up: false },
            { label: "Unit Deployment", value: "98%", up: true },
            { label: "Response Time", value: "4.2m", up: true },
            { label: "Resource Margin", value: "22%", up: false }
        ]
    }
};

const MockAssets = [
    { id: "ASSET-101", name: "Primary Route Alpha", location: "Dallas Hub", status: "Active", stock: "85%", color: "#38bdf8", eta: "45m", dist: "120km", coords: [[32.7767, -96.7970], [41.8781, -87.6298]] },
    { id: "ASSET-102", name: "Secondary Bypass", location: "Chicago Center", status: "Delayed", stock: "40%", color: "#facc15", eta: "2h 15m", dist: "350km", coords: [[40.7128, -74.0060], [34.0522, -118.2437]] },
    { id: "ASSET-103", name: "Express Corridor", location: "New York Port", status: "Optimized", stock: "92%", color: "#22c55e", eta: "15m", dist: "45km", coords: [[25.7617, -80.1918], [47.6062, -122.3321]] },
    { id: "ASSET-104", name: "Local Loop 5", location: "Austin Base", status: "Active", stock: "65%", color: "#818cf8", eta: "10m", dist: "12km", coords: [[39.7392, -104.9903], [33.7490, -84.3880]] }
];
