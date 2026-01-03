import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const teamMembers = [
    {
        name: 'Bonthalakoti Ritesh',
        college: 'SPC',
        image: '/ritesh.png'
    },
    {
        name: 'Thalada Srinivas',
        college: 'JNTUK',
        image: '/srinivas.jpeg'
    },
    {
        name: 'Avinash Anusuri',
        college: 'AU',
        image: '/avinash.jpeg'
    },
    {
        name: 'Jamili Gowrish',
        college: 'NSRIT',
        image: '/GOWRISH PHOTO.jpg'
    },
    {
        name: 'Mandavilli Raju Rishi Deep',
        college: 'GVP',
        image: '/rishi.jpeg'
    },
];

const TeamMemberCard = ({ member, index, hoveredMember, setHoveredMember }: { member: any, index: number, hoveredMember: number | null, setHoveredMember: (i: number | null) => void }) => (
    <div
        className="relative group perspective-1000"
        onMouseEnter={() => setHoveredMember(index)}
        onMouseLeave={() => setHoveredMember(null)}
    >
        <div className="bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col items-center text-center h-full relative z-10 w-full lg:w-64 mx-auto">
            <div className="bg-white rounded-full p-0.5 mb-4 overflow-hidden h-32 w-32 border-4 border-white shadow-md">
                <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-center rounded-full"
                />
            </div>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{member.name}</h3>
            <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wider">{member.college}</p>
        </div>

        {/* Hover Popup Card */}
        <AnimatePresence>
            {hoveredMember === index && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-64 bg-gray-900 text-white rounded-xl shadow-2xl p-5 z-50 pointer-events-none"
                >
                    <div className="flex items-center space-x-3">
                        <img src={member.image} alt={member.name} className="w-12 h-12 rounded-full border-2 border-primary object-cover" />
                        <div className="text-left">
                            <p className="font-bold text-base text-white leading-tight">{member.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wide">{member.college}</p>
                        </div>
                    </div>
                    {/* Arrow */}
                    <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45"></div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const Team: React.FC = () => {
    const [hoveredMember, setHoveredMember] = useState<number | null>(null);

    return (
        <section id="team" className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">404 team name not found</h2>
                    <p className="text-xl text-gray-600">The minds behind Smart Home Energy Manager.</p>
                </div>

                <div className="max-w-6xl mx-auto space-y-12">
                    {/* Top Row: 3 members */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {teamMembers.slice(0, 3).map((member, index) => (
                            <TeamMemberCard
                                key={index}
                                member={member}
                                index={index}
                                hoveredMember={hoveredMember}
                                setHoveredMember={setHoveredMember}
                            />
                        ))}
                    </div>

                    {/* Bottom Row: 2 members */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {teamMembers.slice(3).map((member, index) => (
                            <TeamMemberCard
                                key={index + 3}
                                member={member}
                                index={index + 3}
                                hoveredMember={hoveredMember}
                                setHoveredMember={setHoveredMember}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Team;
