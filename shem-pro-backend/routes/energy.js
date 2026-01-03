const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

module.exports = (io) => {
    router.post("/", async (req, res) => {
        const { voltage, current, power, energy_kWh, cost_rs } = req.body;

        const { data, error } = await supabase
            .from("energy_readings")
            .insert([{
                voltage,
                current,
                power,
                energy_kwh: energy_kWh,
                cost_rs
            }])
            .select();

        if (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        }

        // Optional: still emit via socket (fallback)
        io.emit("energy-update", data?.[0]);

        res.status(200).json({ success: true, data: data?.[0] });
    });

    return router;
};
