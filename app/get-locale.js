// Load locales as dictionaries

export const locales = {
    en: require('./locales/en.json'),
    fr: require('./locales/fr.json')
}

export function getLocale(lang) {
    // Check if the locale exists in the locales object
    return locales[lang] 
}
