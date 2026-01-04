/**
 * SHEM Mock Data Sender
 * 
 * Simulates ESP32 sensor data for testing the frontend dashboard
 * without requiring actual hardware.
 * 
 * Usage: node mockDataSender.js
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000/api/energy';
const INTERVAL_MS = 5000; // Send data every 5 seconds
const COST_PER_KWH = 6.0;

// Simulated state
let state = {
    voltage: 230,
    current: 2.5,
    power: 575,
    energy_kWh: 0.5,
    cost_rs: 3.0,
    lastUpdate: Date.now()
};

// Random fluctuation helper
function fluctuate(value, min, max, range) {
    const change = (Math.random() - 0.5) * range;
    return Math.max(min, Math.min(max, value + change));
}

// Generate realistic sensor data
function generateData() {
    const now = Date.now();
    const deltaHours = (now - state.lastUpdate) / 3600000;

    // Fluctuate voltage (220-240V range)
    state.voltage = fluctuate(state.voltage, 220, 240, 5);

    // Fluctuate current (1-5A range with occasional spikes)
    if (Math.random() < 0.1) {
        // 10% chance of appliance turning on/off
        state.current = 1 + Math.random() * 4;
    } else {
        state.current = fluctuate(state.current, 0.5, 5, 0.3);
    }

    // Calculate power
    state.power = state.voltage * state.current * 0.95; // 0.95 power factor

    // Accumulate energy
    state.energy_kWh += (state.power / 1000) * deltaHours;

    // Calculate cost
    state.cost_rs = state.energy_kWh * COST_PER_KWH;

    state.lastUpdate = now;

    return {
        voltage: parseFloat(state.voltage.toFixed(2)),
        current: parseFloat(state.current.toFixed(3)),
        power: parseFloat(state.power.toFixed(1)),
        energy_kWh: parseFloat(state.energy_kWh.toFixed(4)),
        cost_rs: parseFloat(state.cost_rs.toFixed(2))
    };
}

// Send data to backend
async function sendData() {
    const data = generateData();

    console.log('\n📊 Sending mock sensor data:');
    console.log(`   Voltage:  ${data.voltage} V`);
    console.log(`   Current:  ${data.current} A`);
    console.log(`   Power:    ${data.power} W`);
    console.log(`   Energy:   ${data.energy_kWh} kWh`);
    console.log(`   Cost:     ₹${data.cost_rs}`);

    try {
        const response = await axios.post(BACKEND_URL, data);
        console.log(`   ✅ Response: ${response.status} - ${JSON.stringify(response.data)}`);
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('   ❌ Error: Backend not running! Start with: npm run server');
        } else {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
}

// Main
console.log('🔌 SHEM Mock Data Sender Started');
console.log(`   Target: ${BACKEND_URL}`);
console.log(`   Interval: ${INTERVAL_MS / 1000} seconds`);
console.log('   Press Ctrl+C to stop\n');

// Send immediately, then on interval
sendData();
setInterval(sendData, INTERVAL_MS);
