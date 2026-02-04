import React, { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => useContext(LanguageContext)

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('es') // Default to Spanish

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language')
        if (savedLanguage) {
            setLanguage(savedLanguage)
        } else {
            // Auto-detect browser language
            const browserLang = navigator.language.split('-')[0]
            if (['es', 'en'].includes(browserLang)) {
                setLanguage(browserLang)
            }
        }
    }, [])

    const changeLanguage = (lang) => {
        setLanguage(lang)
        localStorage.setItem('language', lang)
    }

    // Translation dictionary (Basic MVP)
    const translations = {
        es: {
            navbar: {
                title: 'Sistema Maestro AMROIS'
            },
            settings: {
                title: 'Configuración',
                language: 'Idioma',
                theme: 'Tema'
            }
        },
        en: {
            navbar: {
                title: 'AMROIS Master System'
            },
            settings: {
                title: 'Settings',
                language: 'Language',
                theme: 'Theme'
            }
        }
    }

    const t = (key) => {
        const keys = key.split('.')
        let current = translations[language]
        for (const k of keys) {
            if (current[k] === undefined) return key
            current = current[k]
        }
        return current
    }

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}
