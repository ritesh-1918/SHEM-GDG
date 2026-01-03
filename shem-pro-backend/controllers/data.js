const supabase = require('../supabaseClient');

exports.postData = async (req, res) => {
  const { voltage, current, power, energy } = req.body;

  try {
    const { data, error } = await supabase
      .from('energy_readings')
      .insert([{
        device: req.user.id, // Store user ID as device identifier for now context
        voltage,
        current,
        power,
        energy_kwh: energy
      }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getLatestData = async (req, res) => {
  try {
    const { data: latestData, error } = await supabase
      .from('energy_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !latestData) return res.status(404).json({ msg: 'No data found' });
    res.json(latestData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getLiveSensorData = async (req, res) => {
  try {
    const { data: latestESP32 } = await supabase
      .from('energy_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (latestESP32) {
      return res.json({
        voltage: latestESP32.voltage,
        current: latestESP32.current,
        power: latestESP32.power,
        energy: latestESP32.energy_kwh,
        timestamp: latestESP32.created_at
      });
    }

    // Mock Fallback
    return res.json({
      voltage: 230 + Math.random() * 10 - 5,
      current: 5.2 + Math.random() * 0.5 - 0.25,
      power: 1200 + Math.random() * 100 - 50,
      energy: 3.5 + Math.random() * 0.1 - 0.05,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getHistoryData = async (req, res) => {
  try {
    const { data: historyData, error } = await supabase
      .from('energy_readings')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100); // Limit to last 100 readings for graph

    if (error) throw error;
    res.json(historyData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};