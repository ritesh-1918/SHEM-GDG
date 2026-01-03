// Stubbed Gemini AI Insights Service
// AI Chat temporarily disabled for Supabase migration

const askQuestion = async (userId, sessionId, question, contextData, language = 'en', voiceInput = false) => {
    return {
        answer: "I am currently undergoing a system upgrade (Supabase Migration). My AI capabilities are temporarily unavailable. Please try again later.",
        actionItems: [],
        estimatedSavings: null,
        followUpQuestion: null,
        provider: 'stub',
        rateLimitRemaining: 10,
        sessionId
    };
};

const getHistory = async (userId, limit = 10) => {
    return [];
};

const getConversation = async (userId, sessionId) => {
    return null;
};

const prepareContext = (contextData) => {
    return "";
};

const parseResponse = (response) => {
    return {};
};

const checkRateLimit = async (userId) => {
    return { allowed: true, remaining: 10 };
};

module.exports = {
    askQuestion,
    getHistory,
    getConversation,
    prepareContext,
    parseResponse,
    checkRateLimit
};
