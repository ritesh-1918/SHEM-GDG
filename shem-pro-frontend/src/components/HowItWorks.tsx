import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoltIcon, CpuChipIcon, CloudIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { PlayIcon, XMarkIcon } from '@heroicons/react/24/solid';

const steps = [
    {
        id: 1,
        title: 'Precision Sensing',
        description: 'ZMPT101B and SCT-013 sensors measure RMS voltage and current with high accuracy.',
        icon: <BoltIcon className="w-8 h-8 text-white" />,
        color: 'bg-blue-500',
    },
    {
        id: 2,
        title: 'Intelligent Processing',
        description: 'ESP32 controller computes real-time power, energy, and power factor.',
        icon: <CpuChipIcon className="w-8 h-8 text-white" />,
        color: 'bg-purple-500',
    },
    {
        id: 3,
        title: 'Smart Connectivity',
        description: 'Data streams via WiFi/MQTT to the Blynk 2.0 mobile dashboard.',
        icon: <CloudIcon className="w-8 h-8 text-white" />,
        color: 'bg-cyan-500',
    },
    {
        id: 4,
        title: 'AI Analysis',
        description: 'Gemini AI integration analyzes usage patterns for actionable insights.',
        icon: <SparklesIcon className="w-8 h-8 text-white" />,
        color: 'bg-green-500',
    },
];

const HowItWorks: React.FC = () => {
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    return (
        <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">How SHEM Works</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400">From sensing to actionable insights.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    {/* Left Column - Steps 1 & 2 */}
                    <div className="space-y-12 flex flex-col justify-center">
                        {steps.slice(0, 2).map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className="flex flex-col items-center lg:items-end text-center lg:text-right"
                            >
                                <div className={`p-4 rounded-full ${step.color} shadow-lg mb-4`}>
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 max-w-xs">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Center Column - Video Thumbnail / Play Button */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700 aspect-video bg-gray-900 group cursor-pointer"
                        onClick={() => setIsVideoOpen(true)}
                    >
                        {/* Thumbnail Image Placeholder (Gradient for now) */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                            {/* Optional: Add a real thumbnail image here */}
                        </div>

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 ring-4 ring-white/10 group-hover:ring-white/20 group-hover:scale-110">
                                <PlayIcon className="w-10 h-10 text-white ml-1" />
                            </div>
                        </div>

                        <div className="absolute bottom-6 left-0 right-0 text-center">
                            <span className="text-white font-semibold text-lg drop-shadow-md">Watch Demo</span>
                        </div>
                    </motion.div>

                    {/* Right Column - Steps 3 & 4 */}
                    <div className="space-y-12 flex flex-col justify-center">
                        {steps.slice(2, 4).map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className="flex flex-col items-center lg:items-start text-center lg:text-left"
                            >
                                <div className={`p-4 rounded-full ${step.color} shadow-lg mb-4`}>
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 max-w-xs">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Video Modal Overlay */}
            <AnimatePresence>
                {isVideoOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsVideoOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-4xl aspect-video bg-black rounded-lg shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()} // Prevent close on modal click
                        >
                            <button
                                onClick={() => setIsVideoOpen(false)}
                                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>

                            <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/NNFMUHOcq2o?si=_1XPGDIK7r8ljUN7&autoplay=1"
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default HowItWorks;
