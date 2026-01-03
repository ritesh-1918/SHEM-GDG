const supabase = require('../supabaseClient');

const receiveData = async (req, res) => {
  try {
    const { voltage, current, power, energy_kWh, cost_rs } = req.body;

    // Basic validation
    if (voltage === undefined || current === undefined || power === undefined || energy_kWh === undefined || cost_rs === undefined) {
      return res.status(400).json({ message: 'All sensor data fields are required' });
    }

    const newSensorData = new ESP32Data({
      voltage,
      current,
      power,
      energy_kWh,
      cost_rs,
    });

    // Sync to Supabase
    const { error: supabaseError } = await supabase
      .from('energy_readings')
      .insert([{
        voltage,
        current,
        power,
        energy_kwh: energy_kWh,
        cost_rs
      }]);

    if (supabaseError) {
      console.error('Supabase Sync Error:', supabaseError.message);
      return res.status(500).json({ message: 'Error saving to Supabase' });
    }

    console.log('Synced to Supabase energy_readings');
    res.status(200).json({ message: 'Data received and saved successfully' });
  } catch (error) {
    console.error('Error receiving ESP32C6 data:', error);
    res.status(500).json({ message: 'Error receiving data' });
  }
};

const getLatestData = async (req, res) => {
  try {
    const { data: latestData, error } = await supabase
      .from('energy_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // if no rows found .single() returns error code 'PGRST116'
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'No sensor data found' });
      }
      throw error;
    }

    // Transform Supabase structure to match expected frontend structure if needed
    // Frontend expects: { power, voltage, current, energy_kWh, timestamp (created_at) }
    const formattedData = {
      ...latestData,
      timestamp: latestData.created_at,
      energy_kWh: latestData.energy_kwh // remap casing
    };

    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching latest ESP32C6 data:', error);
    res.status(500).json({ message: 'Error fetching data' });
  }
};

module.exports = { receiveData, getLatestData };