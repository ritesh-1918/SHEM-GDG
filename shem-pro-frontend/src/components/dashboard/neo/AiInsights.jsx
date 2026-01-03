import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { generateAIResponse } from '../../../services/aiLLM';

const AiInsights = ({ data }) => {
    const { t } = useTranslation();
    const [insight, setInsight] = useState(t('aiInsight.analyzing'));
    const [loading, setLoading] = useState(false);

    const fetchInsight = async () => {
        setLoading(true);
        // Simple prompt for quick insight
        const prompt = "Give me one specific, actionable one-sentence tip based on my current energy usage to save money right now.";
        const response = await generateAIResponse(prompt, data);
        setInsight(response);
        setLoading(false);
    };

    // Removed automatic fetching on data change to limit API usage.
    // Insight can be fetched manually via the button below.
    // If periodic updates are desired, implement a timer with a longer interval.

    return (
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-xl p-6 border border-dashboard-textSecondary/20 relative overflow-hidden text-dashboard-text">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <img src="/favicon.png" alt="SHEM Logo" className="w-32 h-32 object-contain" />
            </div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-accent/10 rounded-lg">
                        <img src="/favicon.png" alt="SHEM Logo" className="w-5 h-5 object-contain" />
                    </div>
                    <h3 className="font-bold">{t('aiInsight.title')}</h3>
                </div>
                <button
                    onClick={fetchInsight}
                    disabled={loading}
                    className="text-white/70 hover:text-white transition-colors"
                >
                    <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <p className="text-sm italic relative z-10 min-h-[40px]">
                "{insight}"
            </p>
        </div>
    );
};

export default AiInsights;
