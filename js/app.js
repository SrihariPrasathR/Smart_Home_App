// Smart Home App JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Smart Home App initialized');

    // Initialize dashboard
    initializeDashboard();
});

function initializeDashboard() {
    const dashboard = document.querySelector('.dashboard');
    const controls = document.querySelector('.controls');

    if (dashboard && controls) {
        // Add interactive elements to the existing controls section
        controls.innerHTML += `
            <div class="device-grid">
                <div class="device-card">
                    <h4>🏠 Living Room</h4>
                    <button class="device-btn" onclick="toggleDevice('living-room')">Turn On Lights</button>
                </div>
                <div class="device-card">
                    <h4>🛏️ Bedroom</h4>
                    <button class="device-btn" onclick="toggleDevice('bedroom')">Turn On Lights</button>
                </div>
                <div class="device-card">
                    <h4>🍳 Kitchen</h4>
                    <button class="device-btn" onclick="toggleDevice('kitchen')">Turn On Lights</button>
                </div>
            </div>
        `;

        // Add status indicator
        const statusDiv = document.createElement('div');
        statusDiv.className = 'status';
        statusDiv.innerHTML = '<p id="status-text">System Status: All devices operational</p>';
        dashboard.appendChild(statusDiv);
    }
}

function toggleDevice(room) {
    const statusText = document.getElementById('status-text');
    const button = event.target;

    if (button.textContent.includes('On')) {
        button.textContent = 'Turn Off Lights';
        button.classList.add('active');
        statusText.textContent = `System Status: ${room.replace('-', ' ')} lights turned on`;
    } else {
        button.textContent = 'Turn On Lights';
        button.classList.remove('active');
        statusText.textContent = `System Status: ${room.replace('-', ' ')} lights turned off`;
    }
}
