import React, { useState, useRef, useEffect } from 'react';
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
import { generateAIResponse } from '../../../services/aiLLM';

const ShemChat = ({ contextData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I am SHEM-AI. Ask me about your energy usage.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const response = await generateAIResponse(input, contextData);

        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        setLoading(false);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all duration-300 z-50 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-accent hover:bg-yellow-400'
                    }`}
            >
                {isOpen ? (
                    <XMarkIcon className="h-6 w-6 text-white" />
                ) : (
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-dashboard-bg" />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-dashboard-card border border-dashboard-textSecondary/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden fade-in-up">
                    {/* Header */}
                    <div className="bg-dashboard-bg p-4 border-b border-dashboard-textSecondary/10 flex items-center gap-2">
                        <img src="/chatbot.jpeg" alt="SHEM" className="w-6 h-6 rounded-full object-contain bg-white p-0.5" />
                        <h3 className="font-bold text-dashboard-text">SHEM Assistant</h3>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user'
                                    ? 'bg-accent text-dashboard-bg self-end ml-auto rounded-br-none'
                                    : 'bg-dashboard-text/10 text-dashboard-text self-start rounded-bl-none'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        ))}
                        {loading && (
                            <div className="bg-dashboard-text/5 self-start p-3 rounded-lg rounded-bl-none">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-dashboard-textSecondary rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-dashboard-textSecondary rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-dashboard-textSecondary rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-dashboard-bg border-t border-dashboard-textSecondary/10 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about your energy..."
                            className="flex-1 bg-dashboard-text/5 border border-dashboard-textSecondary/20 rounded-lg px-3 py-2 text-dashboard-text placeholder-dashboard-textSecondary focus:outline-none focus:border-accent font-sans text-sm"
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className="p-2 bg-accent rounded-lg text-dashboard-bg hover:bg-yellow-400 disabled:opacity-50"
                        >
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ShemChat;
