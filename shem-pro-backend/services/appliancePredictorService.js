const supabase = require('../supabaseClient');

// Appliance Predictor Service (Supabase Edition)
// Uses heuristics on 'consumption_history'

const APPLIANCE_SIGNATURES = {
    'AC': { name: 'Air Conditioner', power: 1500, icon: '❄️' },
    'GEYSER': { name: 'Water Heater', power: 2000, icon: '🔥' },
    'FRIDGE': { name: 'Refrigerator', power: 150, icon: '🧊' },
    'FAN': { name: 'Ceiling Fan', power: 75, icon: '🌀' }
};

const predictAppliances = async (userId) => {
    try {
        // 1. Fetch recent history (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: history, error } = await supabase
            .from('consumption_history')
            .select('hour_of_day, hourly_consumption')
            .eq('user_id', userId)
            .gte('timestamp', sevenDaysAgo.toISOString());

        if (error) throw error;

        if (!history || history.length === 0) {
            return {
                status: 'collecting',
                message: 'No data available yet.'
            };
        }

        // 2. Group by Hour to find patterns
        const hourlyAvg = {}; // hour -> avg_consumption
        const hourlyCounts = {};

        history.forEach(record => {
            const h = record.hour_of_day;
            hourlyAvg[h] = (hourlyAvg[h] || 0) + record.hourly_consumption;
            hourlyCounts[h] = (hourlyCounts[h] || 0) + 1;
        });

        for (let h = 0; h < 24; h++) {
            if (hourlyCounts[h]) hourlyAvg[h] = hourlyAvg[h] / hourlyCounts[h];
        }

        // 3. Apply Heuristics
        const detected = [];
        const baseline = Math.min(...Object.values(hourlyAvg)); // Determine base load (fridge, standby)

        // Fridge (Always on)
        if (baseline > 50) {
            detected.push({ ...APPLIANCE_SIGNATURES.FRIDGE, confidence: 'High', usage: '24/7' });
        }

        // AC (Night time high usage)
        const nightKeys = [22, 23, 0, 1, 2, 3, 4, 5];
        const nightAvg = nightKeys.reduce((sum, h) => sum + (hourlyAvg[h] || 0), 0) / nightKeys.length;
        if (nightAvg > baseline + 800) {
            detected.push({ ...APPLIANCE_SIGNATURES.AC, confidence: 'High', usage: 'Nights' });
        }

        // Geyser (Morning peaks 6-9 AM)
        const morningKeys = [6, 7, 8, 9];
        const morningPeak = Math.max(...morningKeys.map(h => hourlyAvg[h] || 0));
        if (morningPeak > baseline + 1200) {
            detected.push({ ...APPLIANCE_SIGNATURES.GEYSER, confidence: 'Medium', usage: 'Mornings' });
        }

        return {
            status: 'ready',
            likelyAppliances: detected,
            analysis: {
                baseline: Math.round(baseline),
                peakHour: Object.keys(hourlyAvg).reduce((a, b) => hourlyAvg[a] > hourlyAvg[b] ? a : b)
            }
        };

    } catch (error) {
        console.error("Appliance Prediction Error:", error);
        return { status: 'error', message: error.message };
    }
};

module.exports = {
    predictAppliances,
    APPLIANCE_SIGNATURES,
    ELECTRICITY_RATE: 6.5
};
