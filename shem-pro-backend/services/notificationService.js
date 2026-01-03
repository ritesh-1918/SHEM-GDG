// Stubbed Notification Service
// Temporarily disabled for Supabase migration

const sendAnomalyNotification = async (anomalyEvent) => {
    console.log('[STUB] Notification sent:', anomalyEvent);
    return true;
};

module.exports = {
    sendAnomalyNotification
};
