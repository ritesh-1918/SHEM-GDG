const supabase = require('../supabaseClient');

// Stubbed Peak Hours Controller for Supabase Migration
// Uses Supabase 'peak_hour_settings' table

// Hardcoded DISCOM tariff rates fallback (if not in DB)
const DEFAULT_DISCOM_TARIFFS = {
    Delhi: {
        peakHours: [{ startHour: 18, endHour: 23, rate: 8 }],
        offPeakHours: [{ startHour: 0, endHour: 6, rate: 3.5 }],
        averageRate: 6.5
    },
    // ... we can keep the others as constants or move them to a DB table 'tariffs' later
};

const getTariffForState = (userState) => {
    return DEFAULT_DISCOM_TARIFFS[userState] || DEFAULT_DISCOM_TARIFFS['Delhi'];
};

exports.setupPeakHours = async (req, res) => {
    try {
        const { userId, userState } = req.body;

        if (!userId) return res.status(400).json({ error: "Missing userId" });

        // Get tariff defaults
        const tariffData = getTariffForState(userState || 'Delhi');

        // Save to Supabase
        const { data, error } = await supabase
            .from('peak_hour_settings')
            .upsert({
                user_id: userId,
                user_state: userState || 'Delhi',
                peak_hours: tariffData.peakHours,
                off_peak_hours: tariffData.offPeakHours,
                updated_at: new Date()
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            settings: data,
            ratesPeakvsOffpeak: {
                peak: tariffData.peakHours[0]?.rate || 0,
                offPeak: tariffData.offPeakHours[0]?.rate || 0
            }
        });

    } catch (error) {
        console.error("Setup Peak Hours Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.analyzePeakHours = async (req, res) => {
    try {
        const { userId, currentHour, currentConsumption } = req.body;

        // Fetch settings
        const { data: settings, error } = await supabase
            .from('peak_hour_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        // Default values if no settings found
        const safeSettings = settings || {
            peak_hours: [{ startHour: 18, endHour: 23, rate: 8 }],
            off_peak_hours: [{ startHour: 0, endHour: 6, rate: 4 }]
        };

        const peakHours = safeSettings.peak_hours || [];
        const isPeak = peakHours.some(p => currentHour >= p.startHour && currentHour < p.endHour);
        const currentRate = isPeak ? (peakHours[0]?.rate || 8) : 5; // Simplified

        res.json({
            currentHour,
            isPeakHour: isPeak,
            currentRate: currentRate,
            currentConsumption,
            currentCost: `₹${(currentConsumption * currentRate).toFixed(2)}`,
            potentialSavings: isPeak ? {
                ifShiftedToOffpeak: `₹${(currentConsumption * (currentRate - 3)).toFixed(2)}`,
                message: "Shift to after 11 PM to save."
            } : null
        });

    } catch (error) {
        console.error("Analyze Peak Hours Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.monthlyForecast = async (req, res) => {
    try {
        const { userId, dailyAverageConsumption } = req.body;

        // Fetch settings
        const { data: settings } = await supabase
            .from('peak_hour_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        const subsidyLimit = settings?.monthly_subsidy_units || 100;
        const monthlyConsumption = dailyAverageConsumption * 30;

        // Simple calculation logic
        const baseRate = 6;
        const projectedCost = monthlyConsumption * baseRate;

        res.json({
            currentMonthCost: `₹${projectedCost.toFixed(0)}`,
            monthlyConsumption: `${monthlyConsumption.toFixed(0)} units`,
            subsidyApplied: monthlyConsumption <= subsidyLimit,
            subsidyLimit: `${subsidyLimit} units`,
            status: monthlyConsumption > subsidyLimit ? 'Exceeding Subsidy' : 'Within Subsidy'
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
