import axios from 'axios';

// Interfaces
interface AIConfig {
    openRouter?: string;
    groq?: string;
    gemini?: string;
}

const getAIConfig = (): AIConfig => {
    return {
        openRouter: import.meta.env.VITE_OPENROUTER_KEY,
        groq: import.meta.env.VITE_GROQ_KEY,
        gemini: import.meta.env.VITE_GEMINI_KEY
    };
};

const callGemini = async (prompt: string, key: string) => {
    // Using gemini-2.0-flash as determined by backend debugging
    // Using 1.5-flash as a fallback if 2.0 isn't widely available yet, 
    // but the user's latest key seemed to work with flash. 
    // Let's stick to gemini-1.5-flash for safety as 2.0-flash might be preview/unstable relative to simple API.
    // Actually per backend debug, gemini-2.0-flash was in the list.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
    const response = await axios.post(url, {
        contents: [{ parts: [{ text: prompt }] }]
    });
    return response.data.candidates[0].content.parts[0].text;
};

const callGroq = async (prompt: string, key: string) => {
    // Model updated to llama3-70b-8192 as mixtral was decommissioned
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile'
    }, {
        headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
        }
    });
    return response.data.choices[0].message.content;
};

const callOpenRouter = async (prompt: string, key: string) => {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        messages: [{ role: 'user', content: prompt }],
        model: 'openai/gpt-3.5-turbo'
    }, {
        headers: {
            'Authorization': `Bearer ${key}`,
        }
    });
    return response.data.choices[0].message.content;
};

// Context Helper
const prepareContext = (contextData: any) => {
    if (!contextData) return 'No energy data available.';

    const context = {
        currentPower: contextData.power || contextData.currentConsumption || 'N/A',
        voltage: contextData.voltage || 'N/A',
        current: contextData.current || 'N/A',
        todayConsumption: contextData.todayConsumption || contextData.hourlyConsumption || 'N/A',
        monthlyConsumption: contextData.monthlyConsumption || contextData.totalMonthlyConsumption || 'N/A',
        monthlyBudget: contextData.monthlyBudget || 2000,
        topAppliances: contextData.topAppliances || ['AC', 'Refrigerator', 'Water Heater'],
        peakHours: contextData.peakHours || '6 PM - 11 PM',
        peakRate: contextData.peakRate || '₹8/unit',
        temperature: contextData.temperature || '28°C'
    };

    return `
    Current Energy Status:
    - Power: ${context.currentPower}W | Voltage: ${context.voltage}V
    - Today: ${context.todayConsumption} kWh
    - Month: ${context.monthlyConsumption} kWh (Budget: ${context.monthlyBudget})
    - Peak Hours: ${context.peakHours} @ ${context.peakRate}
    - Temp: ${context.temperature}
    `.trim();
};

export const generateAIResponse = async (prompt: string, contextData?: any) => {
    const config = getAIConfig();
    const energyContext = prepareContext(contextData);

    const systemPrompt = `You are SHEM-AI, a smart home energy assistant. 
    ${energyContext}
    
    User Question: ${prompt}
    
    Guidelines:
    - Be helpful and concise (under 100 words).
    - Focus on energy saving and efficiency.
    - Provide specific action items if applicable.
    - Use Indian context (₹).`;

    // Attempt 1: Gemini
    if (config.gemini) {
        try {
            console.log("Attempting Gemini (Frontend)...");
            return await callGemini(systemPrompt, config.gemini);
        } catch (error) {
            console.error("Gemini Frontend Failed:", error);
        }
    }

    // Attempt 2: Groq
    if (config.groq) {
        try {
            console.log("Attempting Groq (Frontend)...");
            return await callGroq(systemPrompt, config.groq);
        } catch (error) {
            console.error("Groq Frontend Failed:", error);
        }
    }

    // Attempt 3: OpenRouter
    if (config.openRouter) {
        try {
            console.log("Attempting OpenRouter (Frontend)...");
            return await callOpenRouter(systemPrompt, config.openRouter);
        } catch (error) {
            console.error("OpenRouter Frontend Failed:", error);
        }
    }

    return "Sorry, I encountered an error communicating with ALL AI services. Please check your API keys.";
};
