import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ChatBubbleLeftRightIcon,
    XMarkIcon,
    PaperAirplaneIcon,
    Cog6ToothIcon,
    ArrowPathIcon,
    MicrophoneIcon,
    StopIcon,
    SpeakerWaveIcon
} from '@heroicons/react/24/solid';
import VoiceService, { LANGUAGE_CODES } from '../services/voiceService';
import { generateAIResponse } from '../services/aiLLM';

// API base URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

// Message component
const Message = ({ message, isUser }) => {
    const time = new Date(message.timestamp).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`max-w-[85%] ${isUser
                ? 'bg-accent text-white rounded-2xl rounded-br-sm'
                : 'bg-dashboard-textSecondary/10 text-dashboard-text rounded-2xl rounded-bl-sm'
                } px-4 py-3`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${isUser ? 'text-white/70' : 'text-dashboard-textSecondary'}`}>
                    {time}
                </p>

                {/* Action items */}
                {!isUser && message.actionItems && message.actionItems.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-dashboard-textSecondary/20">
                        <p className="text-xs text-dashboard-textSecondary mb-1">Action Items:</p>
                        <ul className="text-xs space-y-1">
                            {message.actionItems.slice(0, 3).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-1">
                                    <span className="text-green-400">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Savings estimate */}
                {!isUser && message.estimatedSavings && (
                    <div className="mt-2 px-2 py-1 bg-green-500/20 rounded text-xs text-green-400">
                        💰 Potential savings: {message.estimatedSavings}
                    </div>
                )}
            </div>
        </div>
    );
};

// Typing indicator
const TypingIndicator = ({ thinkingText }) => (
    <div className="flex justify-start mb-3">
        <div className="bg-dashboard-textSecondary/10 rounded-2xl rounded-bl-sm px-4 py-3">
            <div className="flex items-center gap-2">
                <img src="/chatbot.jpeg" alt="SHEM" className="w-5 h-5 rounded-full object-contain" />
                <span className="text-sm text-dashboard-textSecondary">{thinkingText}</span>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    </div>
);

// Main Chat Widget Component
const SHEMChatWidget = ({
    userId = 'user123',
    contextData = {},
    pageContext = 'default'
}) => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [rateLimitRemaining, setRateLimitRemaining] = useState(null);

    // Voice State
    const [voiceService, setVoiceService] = useState(null);
    const [voiceStatus, setVoiceStatus] = useState('idle'); // idle, listening, processing, speaking
    const [voiceTranscript, setVoiceTranscript] = useState('');

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Suggested questions based on context
    const suggestedQuestions = useMemo(() => ({
        default: [
            { text: t('chat.whyBillHigh'), icon: "💸" },
            { text: t('chat.howToDoThis'), icon: "💡" }, // Mapping generic how-to for save more
            { text: t('chat.optimizeDeviceUsage'), icon: "🔌" },
            { text: t('forecast.estimatedCost'), icon: "📈" } // Using estimated cost as proxy for explain forecast
        ],
        dashboard: [
            { text: t('chat.consumptionTrend'), icon: "⚡" },
            { text: t('chat.whichHourCostsMost'), icon: "🔥" },
            { text: t('chat.bestTimeWashingMachine'), icon: "⏰" }
        ],
        analytics: [
            { text: t('chat.consumptionTrend'), icon: "📊" },
            { text: t('chat.whichHourCostsMost'), icon: "💰" },
            { text: t('chat.anyAnomalies'), icon: "⚠️" }
        ],
        control: [
            { text: t('chat.scheduleAC'), icon: "❄️" },
            { text: t('chat.bestTimeWashingMachine'), icon: "👕" },
            { text: t('chat.optimizeDeviceUsage'), icon: "🎯" }
        ]
    }), [t]);

    // Initialize Voice Service
    useEffect(() => {
        const service = new VoiceService(i18n.language || 'en');
        setVoiceService(service);
        return () => {
            if (service) service.destroy();
        };
    }, [i18n.language]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, voiceTranscript]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Get current context
    const getCurrentContext = useCallback(() => {
        const now = new Date();
        return {
            ...contextData,
            dayOfWeek: now.toLocaleDateString('en-IN', { weekday: 'long' }),
            timeOfDay: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            pageContext
        };
    }, [contextData, pageContext]);

    // Voice Handlers
    const startListening = () => {
        if (!voiceService) return;
        try {
            setError(null);
            voiceService.startListening({
                onStart: () => setVoiceStatus('listening'),
                onTranscriptUpdate: (text) => setVoiceTranscript(text),
                onFinalTranscript: (text) => handleVoiceInput(text),
                onError: (err) => {
                    setError(err);
                    setVoiceStatus('idle');
                },
                onEnd: () => {
                    if (voiceStatus === 'listening') setVoiceStatus('idle'); // Or processing if handling flow differently
                }
            });
        } catch (err) {
            setError("Microphone access denied");
        }
    };

    const stopListening = () => {
        if (voiceService) voiceService.stopListening();
        setVoiceStatus('idle');
    };

    const stopSpeaking = () => {
        if (voiceService) voiceService.stopSpeaking();
        setVoiceStatus('idle');
    };

    const handleVoiceInput = (text) => {
        setVoiceTranscript('');
        sendMessage(text, true); // true = from voice
    };

    // Send message
    const sendMessage = async (question, isVoice = false) => {
        if (!question.trim() || isLoading) return;

        const userMessage = {
            role: 'user',
            content: question.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        if (isVoice) setVoiceStatus('processing');
        setError(null);

        try {
            // Direct Frontend Service Call
            const answer = await generateAIResponse(question.trim(), getCurrentContext());

            // Mock data structure to match what UI expects
            const data = {
                answer: answer,
                sessionId: sessionId || 'local-session-' + Date.now(),
                actionItems: [], // Text-only response for now
                estimatedSavings: null,
                rateLimitRemaining: 999
            };

            if (data.sessionId && !sessionId) setSessionId(data.sessionId);
            setRateLimitRemaining(data.rateLimitRemaining);

            const assistantMessage = {
                role: 'assistant',
                content: data.answer,
                timestamp: new Date().toISOString(),
                actionItems: data.actionItems,
                estimatedSavings: data.estimatedSavings,
                followUpQuestion: null
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Speak response if from voice
            if (isVoice && voiceService) {
                setVoiceStatus('speaking');
                voiceService.speak(data.answer, {
                    onEnd: () => setVoiceStatus('idle'),
                    onError: () => setVoiceStatus('idle')
                });
            } else {
                setVoiceStatus('idle');
            }

        } catch (err) {
            console.error('Chat error:', err);
            setError(err.message || t('chat.failedToConnect'));
            if (isVoice && voiceService) {
                voiceService.speak("Sorry, I had trouble connecting.");
            }
            setVoiceStatus('idle');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    // Get suggested questions based on context
    const getSuggestedQuestions = () => {
        const contextQuestions = suggestedQuestions[pageContext] || [];
        const defaultQuestions = suggestedQuestions.default;
        const mixed = [...contextQuestions, ...defaultQuestions];
        return mixed.slice(0, 4);
    };

    // Clear chat
    const clearChat = () => {
        setMessages([]);
        setSessionId(null);
        setError(null);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-accent hover:bg-accent/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}
            >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span className="font-medium">{t('chat.askShem')}</span>
            </button>

            {/* Chat Panel */}
            <div className={`fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                <div className="bg-dashboard-card border border-dashboard-textSecondary/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ height: '600px' }}>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-accent to-blue-600 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {voiceStatus === 'speaking' ? (
                                <SpeakerWaveIcon className="w-5 h-5 text-white animate-pulse" />
                            ) : (
                                <img src="/chatbot.jpeg" alt="SHEM" className="w-6 h-6 rounded-full object-contain bg-white p-0.5" />
                            )}
                            <div>
                                <h3 className="text-white font-bold text-sm">{t('chat.energyAdvisor')}</h3>
                                <p className="text-white/70 text-xs">
                                    {rateLimitRemaining !== null && `999 questions left`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <Cog6ToothIcon className="w-4 h-4 text-white" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <XMarkIcon className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Settings Panel */}
                    {showSettings && (
                        <div className="px-4 py-3 bg-dashboard-textSecondary/10 border-b border-dashboard-textSecondary/20">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-dashboard-text">{t('chat.settings')}</span>
                                <button onClick={clearChat} className="text-xs text-red-400 hover:text-red-300">
                                    {t('chat.clearHistory')}
                                </button>
                            </div>
                            <p className="text-xs text-dashboard-textSecondary">
                                🔒 {t('chat.privacyNote')}
                            </p>
                        </div>
                    )}

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <img src="/chatbot.jpeg" alt="SHEM" className="w-20 h-20 rounded-full object-contain mb-4 opacity-80" />
                                <h4 className="text-dashboard-text font-medium mb-2">{t('chat.greeting')}</h4>
                                <p className="text-dashboard-textSecondary text-sm mb-4">
                                    {t('chat.greetingSubtext')}
                                </p>
                                {/* Suggested Questions */}
                                <div className="w-full space-y-2">
                                    {getSuggestedQuestions().map((q, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => sendMessage(q.text)}
                                            className="w-full flex items-center gap-2 px-3 py-2 bg-dashboard-textSecondary/10 hover:bg-dashboard-textSecondary/20 rounded-xl text-left text-sm text-dashboard-text transition-colors"
                                        >
                                            <span>{q.icon}</span>
                                            <span>{q.text}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, idx) => (
                                    <Message key={idx} message={msg} isUser={msg.role === 'user'} />
                                ))}
                                {isLoading && <TypingIndicator thinkingText={t('chat.thinking')} />}
                                {voiceTranscript && (
                                    <div className="flex justify-end mb-3 animate-pulse">
                                        <div className="bg-accent/50 text-white rounded-2xl rounded-br-sm px-4 py-3 italic">
                                            {voiceTranscript}...
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}

                        {error && (
                            <div className="flex items-center justify-center gap-2 p-3 bg-red-500/10 rounded-xl text-sm text-red-400 mt-2">
                                <span>{error}</span>
                                <button
                                    onClick={() => setError(null)}
                                    className="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded hover:bg-red-500/30"
                                >
                                    <ArrowPathIcon className="w-3 h-3" /> {t('chat.retry')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Follow-up suggestions */}
                    {messages.length > 0 && !isLoading && messages[messages.length - 1]?.role === 'assistant' && (
                        <div className="px-4 py-2 border-t border-dashboard-textSecondary/10 flex gap-2 overflow-x-auto">
                            <button onClick={() => sendMessage(t('chat.tellMeMore'))} className="flex-shrink-0 px-3 py-1.5 bg-dashboard-textSecondary/10 hover:bg-dashboard-textSecondary/20 rounded-full text-xs text-dashboard-text transition-colors">{t('chat.tellMeMore')}</button>
                            <button onClick={() => sendMessage(t('chat.howToDoThis'))} className="flex-shrink-0 px-3 py-1.5 bg-dashboard-textSecondary/10 hover:bg-dashboard-textSecondary/20 rounded-full text-xs text-dashboard-text transition-colors">{t('chat.howToDoThis')}</button>
                            <button onClick={() => sendMessage(t('chat.whatElse'))} className="flex-shrink-0 px-3 py-1.5 bg-dashboard-textSecondary/10 hover:bg-dashboard-textSecondary/20 rounded-full text-xs text-dashboard-text transition-colors">{t('chat.whatElse')}</button>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 border-t border-dashboard-textSecondary/20 bg-dashboard-card z-10">
                        <div className="flex items-center gap-2">
                            {/* Voice Button */}
                            <button
                                onClick={voiceStatus === 'listening' ? stopListening : startListening}
                                className={`p-2.5 rounded-xl transition-all ${voiceStatus === 'listening'
                                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                                    : voiceStatus === 'speaking'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                        : 'bg-dashboard-textSecondary/10 text-dashboard-textSecondary hover:bg-dashboard-textSecondary/20'
                                    }`}
                                title={voiceStatus === 'listening' ? 'Stop Listening' : 'Voice Input'}
                            >
                                {voiceStatus === 'listening' ? (
                                    <StopIcon className="w-5 h-5" />
                                ) : voiceStatus === 'speaking' ? (
                                    <StopIcon className="w-5 h-5" onClick={(e) => { e.stopPropagation(); stopSpeaking(); }} />
                                ) : (
                                    <MicrophoneIcon className="w-5 h-5" />
                                )}
                            </button>

                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={voiceStatus === 'listening' ? "Listening..." : t('chat.placeholder')}
                                disabled={isLoading || voiceStatus === 'listening'}
                                className={`flex-1 px-4 py-2.5 bg-dashboard-textSecondary/10 border border-dashboard-textSecondary/20 rounded-xl text-dashboard-text placeholder-dashboard-textSecondary text-sm focus:outline-none focus:border-accent ${voiceStatus === 'listening' ? 'italic' : ''}`}
                            />
                            <button
                                onClick={() => sendMessage(input)}
                                disabled={!input.trim() || isLoading}
                                className="p-2.5 bg-accent hover:bg-accent/80 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl transition-colors"
                            >
                                <PaperAirplaneIcon className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        {voiceStatus === 'listening' && (
                            <p className="text-xs text-center mt-2 text-dashboard-textSecondary animate-pulse">
                                Speak now... (Tap red button to stop)
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};


export default SHEMChatWidget;
