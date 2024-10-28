import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'intl-pluralrules';
import zhTW from './zh-TW.json';
import zhCN from './zh-CN.json';

const LANGUAGE_DETECTOR = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const savedLanguage = await AsyncStorage.getItem('user-language');
      callback(savedLanguage || 'zh-TW');
    } catch (error) {
      callback('zh-TW');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language) => {
    try {
      await AsyncStorage.setItem('user-language', language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  }
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      'zh-TW': { translation: zhTW },
      'zh-CN': { translation: zhCN }
    },
    fallbackLng: 'zh-TW',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
