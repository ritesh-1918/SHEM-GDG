const supabase = require('../supabaseClient');

/**
 * Energy Forecast Engine (Supabase Edition)
 * Uses Supabase 'consumption_history' for time-series analysis
 */

// Configuration
const ELECTRICITY_RATE = 6.5;

/**
 * Forecast consumption for next N days
 */
const forecastConsumption = async (userId, daysAhead = 7) => {
    try {
        // 1. Fetch History from Supabase
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: history, error } = await supabase
            .from('consumption_history')
            .select('timestamp, hourly_consumption')
            .eq('user_id', userId)
            .gte('timestamp', thirtyDaysAgo.toISOString())
            .order('timestamp', { ascending: true });

        if (error) throw error;

        if (!history || history.length < 24) {
            return {
                status: 'insufficient_data',
                dataPoints: history ? history.length : 0,
                daysNeeded: 7
            };
        }

        // 2. Calculate Daily Averages
        const dailyTotals = {};
        history.forEach(record => {
            const dateStr = new Date(record.timestamp).toISOString().split('T')[0];
            dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + record.hourly_consumption;
        });

        const dailyValues = Object.values(dailyTotals);
        const recentAvg = dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length;

        // Simple trend (last 3 days vs previous 3 days)
        let trend = 0;
        if (dailyValues.length >= 6) {
            const recent3 = dailyValues.slice(-3).reduce((a, b) => a + b, 0);
            const prev3 = dailyValues.slice(-6, -3).reduce((a, b) => a + b, 0);
            trend = (recent3 - prev3) / prev3; // % change
        }

        // 3. Generate Forecast
        const forecasts = [];
        const today = new Date();

        for (let i = 0; i < daysAhead; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i + 1);

            // Apply trend decay (trend impact reduces over time)
            const trendImpact = trend * (1 / (i + 1));

            // Simple logic: Average * (1 + trend)
            let predicted = recentAvg * (1 + trendImpact);

            // Add some noise/variation based on day of week? (Optional)

            forecasts.push({
                date: date.toISOString().split('T')[0],
                dayName: date.toLocaleDateString('en-IN', { weekday: 'long' }),
                predicted: Math.round(predicted),
                confidence: 'Medium',
                cost: Math.round(predicted * ELECTRICITY_RATE / 1000) // Assuming consumption is in Wh convert to kWh for cost? Wh wait.
                // DB schema said hourly_consumption is float. Usually Wh or kWh? 
                // Schema comment said "In Wh". So predicted is in Wh.
                // Cost = (Wh / 1000) * Rate.
            });
        }

        return {
            status: 'ready',
            forecasts,
            metrics: {
                recentAverage: Math.round(recentAvg),
                trend: trend > 0.05 ? 'increasing' : trend < -0.05 ? 'decreasing' : 'stable'
            }
        };

    } catch (error) {
        console.error("Forecast Error:", error);
        return { status: 'error', message: error.message };
    }
};

const getNextDayForecast = async (userId) => {
    const result = await forecastConsumption(userId, 1);
    if (result.status !== 'ready') return result;
    return result.forecasts[0];
};

const getWeekForecast = async (userId) => {
    return await forecastConsumption(userId, 7);
};

const getMonthForecast = async (userId) => {
    const result = await forecastConsumption(userId, 30);
    if (result.status !== 'ready') return result;
    const total = result.forecasts.reduce((sum, f) => sum + f.predicted, 0);
    return {
        status: 'ready',
        predictedTotal: total,
        predictedCost: Math.round((total / 1000) * ELECTRICITY_RATE),
        forecasts: result.forecasts
    };
};

module.exports = {
    forecastConsumption,
    getNextDayForecast,
    getWeekForecast,
    getMonthForecast
};
