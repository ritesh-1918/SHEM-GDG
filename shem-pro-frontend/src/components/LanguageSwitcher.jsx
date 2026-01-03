import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/i18n';
import {
    GlobeAltIcon,
    ChevronDownIcon,
    CheckIcon
} from '@heroicons/react/24/solid';

// API base URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Compact language switcher for navbar
export const NavbarLanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];
    const quickLanguages = LANGUAGES.slice(0, 4); // First 4 languages for quick access

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = async (langCode) => {
        await i18n.changeLanguage(langCode);
        localStorage.setItem('shem-language', langCode);
        setIsOpen(false);

        // Save to backend (optional - silently fails if not available)
        try {
            const userId = localStorage.getItem('userId') || 'anonymous';
            await fetch(`${API_BASE}/settings/language`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, languageCode: langCode })
            });
        } catch (err) {
            console.log('Could not save language preference to server');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-dashboard-textSecondary/10 hover:bg-dashboard-textSecondary/20 transition-colors text-dashboard-text"
            >
                <span className="text-lg">{currentLang.flag}</span>
                <span className="text-sm font-medium hidden sm:inline">{currentLang.nativeName}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-dashboard-card border border-dashboard-textSecondary/20 rounded-xl shadow-xl overflow-hidden z-50">
                    {quickLanguages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-dashboard-textSecondary/10 transition-colors ${i18n.language === lang.code ? 'bg-accent/10' : ''
                                }`}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="text-sm text-dashboard-text">{lang.nativeName}</span>
                            {i18n.language === lang.code && (
                                <CheckIcon className="w-4 h-4 text-accent ml-auto" />
                            )}
                        </button>
                    ))}
                    <div className="border-t border-dashboard-textSecondary/20">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                // Could open settings modal here
                            }}
                            className="w-full px-4 py-3 text-sm text-accent hover:bg-dashboard-textSecondary/10 transition-colors text-left"
                        >
                            More languages...
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Full language switcher for settings page
const LanguageSwitcher = ({ userId = 'anonymous' }) => {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(false);

    const changeLanguage = async (langCode) => {
        setLoading(true);

        // Change language immediately
        await i18n.changeLanguage(langCode);
        localStorage.setItem('shem-language', langCode);

        // Save to backend
        try {
            await fetch(`${API_BASE}/settings/language`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, languageCode: langCode })
            });
        } catch (err) {
            console.error('Failed to save language preference:', err);
        }

        setLoading(false);
    };

    return (
        <div className="bg-dashboard-card rounded-2xl p-6 border border-dashboard-textSecondary/20">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent/20 rounded-lg">
                    <GlobeAltIcon className="w-6 h-6 text-accent" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-dashboard-text">
                        {t('settings.languagePreferences')}
                    </h3>
                    <p className="text-sm text-dashboard-textSecondary">
                        {t('settings.languageAffects')}
                    </p>
                </div>
            </div>

            {/* Language Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        disabled={loading}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${i18n.language === lang.code
                            ? 'bg-accent/20 border-accent text-dashboard-text'
                            : 'bg-dashboard-textSecondary/5 border-dashboard-textSecondary/20 text-dashboard-text hover:border-accent/50'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="text-xs font-medium text-center">{lang.nativeName}</span>
                        <span className="text-xs text-dashboard-textSecondary">{lang.name}</span>
                        {i18n.language === lang.code && (
                            <CheckIcon className="w-4 h-4 text-accent absolute top-2 right-2" />
                        )}
                    </button>
                ))}
            </div>

            {/* Current Language Info */}
            <div className="mt-4 p-3 bg-dashboard-textSecondary/10 rounded-lg flex items-center gap-3">
                <span className="text-xl">
                    {LANGUAGES.find(l => l.code === i18n.language)?.flag}
                </span>
                <div>
                    <p className="text-sm text-dashboard-text">
                        Current: <span className="font-medium">
                            {LANGUAGES.find(l => l.code === i18n.language)?.nativeName}
                        </span>
                    </p>
                    <p className="text-xs text-dashboard-textSecondary">
                        Language code: {i18n.language}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LanguageSwitcher;
