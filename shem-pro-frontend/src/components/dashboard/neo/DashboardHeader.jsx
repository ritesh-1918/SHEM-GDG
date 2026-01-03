import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BellIcon, ArrowRightStartOnRectangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { NavbarLanguageSwitcher } from '../../LanguageSwitcher';

const DashboardHeader = ({ title, onProfileClick }) => {
    const { t } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showNotifications, setShowNotifications] = useState(false);
    const { logout, user } = useAuth();
    const { notifications, unreadCount, clearAll } = useNotification();

    useEffect(() => {
        const timer = setInterval(() => setCurrentDate(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Close notifications when clicking outside (simple optional enhancement)
    // For now we rely on the toggle button.

    return (
        <header className="flex justify-between items-center py-6 px-8 bg-dashboard-bg/95 backdrop-blur-sm sticky top-0 z-40 border-b border-dashboard-textSecondary/20">
            {/* Left: Title & Date */}
            <div>
                <h1 className="text-2xl font-bold text-dashboard-text mb-1">{title}</h1>
                <div className="flex items-center gap-4 text-sm text-dashboard-textSecondary">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-accent"></span>
                        {format(currentDate, 'MMMM do, h:mm a')}
                    </div>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-6">
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative text-dashboard-textSecondary hover:text-dashboard-text transition-colors p-2 rounded-full hover:bg-dashboard-text/5 ${showNotifications ? 'bg-dashboard-text/10 text-dashboard-text' : ''}`}
                    >
                        <BellIcon className="h-6 w-6" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-dashboard-bg animate-pulse"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-dashboard-card border border-dashboard-textSecondary/20 rounded-xl shadow-xl p-4 z-50">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-dashboard-textSecondary/10">
                                <span className="text-sm font-bold text-dashboard-text">Notifications ({unreadCount})</span>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="text-xs text-dashboard-textSecondary hover:text-dashboard-danger flex items-center gap-1"
                                    >
                                        <TrashIcon className="w-3 h-3" /> Clear
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <p className="text-xs text-center text-dashboard-textSecondary/60 py-4">No new notifications</p>
                                ) : (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`text-xs p-3 rounded-lg border border-dashboard-textSecondary/10 transition-colors ${n.type === 'error' ? 'bg-red-500/10 text-red-500' :
                                                n.type === 'success' ? 'bg-green-500/10 text-green-500' :
                                                    'bg-dashboard-text/5 text-dashboard-textSecondary'
                                                }`}
                                        >
                                            <p className="font-medium">{n.message}</p>
                                            <p className="text-[10px] opacity-60 mt-1 text-right">
                                                {format(new Date(n.timestamp), 'h:mm a')}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Language Switcher */}
                <NavbarLanguageSwitcher />

                <div className="flex items-center gap-3 pl-6 border-l border-dashboard-textSecondary/20">
                    <button
                        onClick={onProfileClick}
                        className="focus:outline-none transition-transform hover:scale-105"
                    >
                        <img
                            src={user?.profileImage || "/profile.png"}
                            alt="Profile"
                            className="w-9 h-9 rounded-full border border-dashboard-textSecondary/30 hover:border-accent transition-colors"
                        />
                    </button>
                    <button
                        onClick={logout}
                        className="p-2 text-dashboard-textSecondary hover:text-dashboard-danger transition-colors bg-dashboard-textSecondary/10 rounded-lg hover:bg-dashboard-textSecondary/20"
                        title="Logout"
                    >
                        <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
