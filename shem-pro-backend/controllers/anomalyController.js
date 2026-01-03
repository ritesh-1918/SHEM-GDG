const supabase = require('../supabaseClient');

// ============================================================================
// CORE LOGIC
// ============================================================================

/**
 * Store hourly consumption data for historical analysis
 */
exports.storeConsumption = async (req, res) => {
    try {
        const { userId, consumption, hour, dayOfWeek, temperature } = req.body;

        if (!userId || consumption === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('consumption_history')
            .insert([{
                user_id: userId,
                hourly_consumption: consumption,
                hour_of_day: hour,
                day_of_week: dayOfWeek,
                temperature: temperature
            }]);

        if (error) throw error;

        // Check if we have enough data to calculate baselines (e.g., > 14 days)
        // For efficiency, we might not trigger this every time, but for now we'll do a simple check
        // or just return success and let a scheduled job or separate call handle baselines.

        res.json({
            success: true,
            message: 'Consumption data stored',
        });
    } catch (error) {
        console.error('Store Consumption Error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Calculate statistical baselines (Mean & Std Dev) for every hour of the week
 * This allows us to detect anomalies based on "normal" behavior
 */
exports.calculateBaselines = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

        // Fetch last 60 days of history
        const { data: history, error: fetchError } = await supabase
            .from('consumption_history')
            .select('hour_of_day, hourly_consumption')
            .eq('user_id', userId)
            .gte('timestamp', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString());

        if (fetchError) throw fetchError;

        if (!history || history.length < 24) {
            return res.json({
                success: false,
                message: 'Not enough data to calculate baselines'
            });
        }

        // Group by hour
        const hourlyData = {};
        for (let i = 0; i < 24; i++) {
            hourlyData[i] = [];
        }

        history.forEach(record => {
            if (hourlyData[record.hour_of_day]) {
                hourlyData[record.hour_of_day].push(record.hourly_consumption);
            }
        });

        // Calculate stats and prepare upsert
        const updates = [];
        for (let hour = 0; hour < 24; hour++) {
            const values = hourlyData[hour];
            if (values.length > 5) { // Need simpler min validation
                const mean = values.reduce((a, b) => a + b, 0) / values.length;
                const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
                const stdDev = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);

                updates.push({
                    user_id: userId,
                    hour: hour,
                    mean: mean,
                    std_dev: stdDev,
                    min_val: Math.min(...values),
                    max_val: Math.max(...values),
                    data_points: values.length,
                    threshold_multiplier: 2.0 // Default Z-score threshold
                });
            }
        }

        if (updates.length > 0) {
            const { error: upsertError } = await supabase
                .from('baseline_statistics')
                .upsert(updates, { onConflict: 'user_id, hour' });

            if (upsertError) throw upsertError;
        }

        res.json({
            success: true,
            message: 'Baseline statistics updated',
            baselinesCount: updates.length
        });

    } catch (error) {
        console.error('Calculate Baselines Error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Analyze real-time consumption for anomalies
 */
exports.analyzeAnomaly = async (req, res) => {
    try {
        const { userId, consumptionValue, currentHour } = req.body;

        if (!userId || consumptionValue === undefined) {
            return res.status(400).json({ error: 'Missing required data' });
        }

        // Get baseline for this hour
        const { data: baseline, error } = await supabase
            .from('baseline_statistics')
            .select('*')
            .eq('user_id', userId)
            .eq('hour', currentHour)
            .single();

        // If no baseline, we can't detect anomaly
        if (error || !baseline) {
            return res.json({
                isAnomaly: false,
                status: 'learning',
                message: 'System is learning your patterns'
            });
        }

        const { mean, std_dev, threshold_multiplier } = baseline;

        // Avoid division by zero if std_dev is 0 (constant consumption)
        const safeStdDev = std_dev === 0 ? 1 : std_dev;
        const zScore = (consumptionValue - mean) / safeStdDev;
        const isAnomaly = Math.abs(zScore) > threshold_multiplier;

        let anomalyRecord = null;
        if (isAnomaly) {
            // Determine severity
            const confidence = Math.abs(zScore) > 3 ? 'high' : 'medium';
            const deviationPercent = ((consumptionValue - mean) / mean) * 100;

            const newRecord = {
                user_id: userId,
                hour_of_day: currentHour,
                consumption: consumptionValue,
                expected_mean: mean,
                expected_std_dev: std_dev,
                z_score: zScore,
                confidence: confidence,
                deviation: `${Math.round(deviationPercent)}% ${consumptionValue > mean ? 'higher' : 'lower'}`,
                deviation_percent: deviationPercent,
                possible_cause: consumptionValue > mean ? 'High power appliance usage' : 'Unusual drop',
                recommendation: consumptionValue > mean ? 'Check AC or Heater settings' : 'Check if appliance failed',
                status: 'detected'
            };

            const { data: savedAnomaly, error: saveError } = await supabase
                .from('anomaly_events')
                .insert([newRecord])
                .select()
                .single();

            if (!saveError) anomalyRecord = savedAnomaly;
        }

        res.json({
            isAnomaly,
            zScore,
            currentValue: consumptionValue,
            expectedRange: {
                min: Math.max(0, mean - (std_dev * threshold_multiplier)),
                max: mean + (std_dev * threshold_multiplier)
            },
            anomalyEvent: anomalyRecord
        });

    } catch (error) {
        console.error('Analyze Anomaly Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAnomalyHistory = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        const { data, error } = await supabase
            .from('anomaly_events')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false })
            .limit(50);

        if (error) throw error;

        res.json({
            totalAnomalies: data.length,
            anomalies: data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.reportAnomaly = async (req, res) => {
    try {
        const { userId, anomalyId, feedbackType, appliance } = req.body; // feedbackType: 'normal' (false positive) or 'problem'

        if (feedbackType === 'normal') {
            // Update Anomaly Status
            await supabase
                .from('anomaly_events')
                .update({ status: 'false_positive' })
                .eq('id', anomalyId);

            // Log feedback to adjust thresholds later
            // For now, let's just widen the threshold for this hour immediately
            const { data: anomaly } = await supabase.from('anomaly_events').select('hour_of_day, user_id').eq('id', anomalyId).single();

            if (anomaly) {
                await supabase.rpc('increment_threshold', {
                    p_user_id: userId,
                    p_hour: anomaly.hour_of_day,
                    p_increment: 0.1
                });
                // Note: RPC might not exist, so let's do safe fetch-update
                const { data: stats } = await supabase.from('baseline_statistics').select('threshold_multiplier').eq('user_id', userId).eq('hour', anomaly.hour_of_day).single();
                if (stats) {
                    await supabase.from('baseline_statistics').update({ threshold_multiplier: stats.threshold_multiplier + 0.2 }).eq('user_id', userId).eq('hour', anomaly.hour_of_day);
                }
            }
        } else {
            await supabase
                .from('anomaly_events')
                .update({ status: 'acknowledged', user_feedback: { appliance } })
                .eq('id', anomalyId);
        }

        res.json({ success: true, message: 'Feedback recorded' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBaselines = async (req, res) => {
    try {
        const { userId } = req.query;
        const { data, error } = await supabase
            .from('baseline_statistics')
            .select('*')
            .eq('user_id', userId)
            .order('hour', { ascending: true });

        if (error) throw error;

        res.json({ baselines: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
