const DEFAULT_LANGUAGE = 'en';

const supportedLanguages = [
  'en', 'hi', 'gu', 'mr', 'bn', 'ta', 'te', 'kn', 'ml', 'pa', 'or', 'as',
  'ur', 'sa', 'ks', 'sd', 'kok', 'mai', 'mni', 'ne', 'doi', 'bho', 'sat',
  'tcy', 'brx', 'raj', 'gom',
];

const translations = {
  en: {
    'api.genericError': 'Something went wrong. Please try again.',
    'api.internalServerError': 'Internal server error',
    'api.unauthorized': 'Unauthorized access',
    'api.invalidCredentials': 'Invalid email or password',
    'api.emailRequired': 'Email is required',
    'api.passwordResetSent': 'If an account exists, a reset code has been sent.',
    'api.passwordResetSuccess': 'Password reset successfully',
    'api.passwordChanged': 'Password changed successfully',
    'api.invalidOtp': 'Invalid or expired OTP',
  },
  hi: {
    'api.genericError': 'कुछ गलत हुआ। कृपया फिर कोशिश करें।',
    'api.internalServerError': 'आंतरिक सर्वर त्रुटि',
    'api.unauthorized': 'अनधिकृत पहुंच',
    'api.invalidCredentials': 'अमान्य ईमेल या पासवर्ड',
    'api.emailRequired': 'ईमेल आवश्यक है',
    'api.passwordResetSent': 'यदि खाता मौजूद है, तो रीसेट कोड भेज दिया गया है।',
    'api.passwordResetSuccess': 'पासवर्ड सफलतापूर्वक रीसेट हो गया',
    'api.passwordChanged': 'पासवर्ड सफलतापूर्वक बदल गया',
    'api.invalidOtp': 'अमान्य या समाप्त OTP',
  },
  gu: {
    'api.genericError': 'કંઈક ખોટું થયું. કૃપા કરીને ફરી પ્રયાસ કરો.',
    'api.internalServerError': 'આંતરિક સર્વર ભૂલ',
    'api.unauthorized': 'અનધિકૃત ઍક્સેસ',
    'api.invalidCredentials': 'અમાન્ય ઇમેઇલ અથવા પાસવર્ડ',
    'api.emailRequired': 'ઇમેઇલ જરૂરી છે',
    'api.passwordResetSent': 'જો ખાતું અસ્તિત્વમાં હશે, તો રીસેટ કોડ મોકલવામાં આવ્યો છે.',
    'api.passwordResetSuccess': 'પાસવર્ડ સફળતાપૂર્વક રીસેટ થયો',
    'api.passwordChanged': 'પાસવર્ડ સફળતાપૂર્વક બદલાયો',
    'api.invalidOtp': 'અમાન્ય અથવા સમાપ્ત OTP',
  },
  mr: {
    'api.genericError': 'काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.',
    'api.internalServerError': 'अंतर्गत सर्व्हर त्रुटी',
    'api.unauthorized': 'अनधिकृत प्रवेश',
    'api.invalidCredentials': 'अवैध ईमेल किंवा पासवर्ड',
    'api.emailRequired': 'ईमेल आवश्यक आहे',
    'api.passwordResetSent': 'खाते अस्तित्वात असल्यास रीसेट कोड पाठवला आहे.',
    'api.passwordResetSuccess': 'पासवर्ड यशस्वीरित्या रीसेट झाला',
    'api.passwordChanged': 'पासवर्ड यशस्वीरित्या बदलला',
    'api.invalidOtp': 'अवैध किंवा कालबाह्य OTP',
  },
  ur: {
    'api.genericError': 'کچھ غلط ہو گیا۔ براہ کرم دوبارہ کوشش کریں۔',
    'api.internalServerError': 'اندرونی سرور خرابی',
    'api.unauthorized': 'غیر مجاز رسائی',
    'api.invalidCredentials': 'غلط ای میل یا پاس ورڈ',
    'api.emailRequired': 'ای میل ضروری ہے',
    'api.passwordResetSent': 'اگر اکاؤنٹ موجود ہے تو ری سیٹ کوڈ بھیج دیا گیا ہے۔',
    'api.passwordResetSuccess': 'پاس ورڈ کامیابی سے ری سیٹ ہو گیا',
    'api.passwordChanged': 'پاس ورڈ کامیابی سے تبدیل ہو گیا',
    'api.invalidOtp': 'غلط یا میعاد ختم OTP',
  },
};

const stringToKey = {
  'Something went wrong. Please try again.': 'api.genericError',
  'Internal server error': 'api.internalServerError',
  'Unauthorized access': 'api.unauthorized',
  'Invalid email or password': 'api.invalidCredentials',
  'Email is required': 'api.emailRequired',
  'If an account exists, a reset code has been sent.': 'api.passwordResetSent',
  'Password reset successfully': 'api.passwordResetSuccess',
  'Password changed successfully': 'api.passwordChanged',
  'Invalid or expired OTP': 'api.invalidOtp',
};

const getSupportedLanguage = (languageCode) => {
  if (!languageCode) return DEFAULT_LANGUAGE;
  const normalized = languageCode.toLowerCase();
  if (supportedLanguages.includes(normalized)) return normalized;
  const base = normalized.split('-')[0];
  return supportedLanguages.includes(base) ? base : DEFAULT_LANGUAGE;
};

const detectRequestLanguage = (req) => {
  const explicitLanguage = req.headers['x-language'];
  const acceptLanguage = req.headers['accept-language']?.split(',')?.[0];
  const cookieLanguage = req.cookies?.jobs_placements_language;
  return getSupportedLanguage(explicitLanguage || cookieLanguage || acceptLanguage);
};

const translate = (keyOrMessage, languageCode = DEFAULT_LANGUAGE) => {
  const language = getSupportedLanguage(languageCode);
  const key = stringToKey[keyOrMessage] || keyOrMessage;
  return translations[language]?.[key] || translations[DEFAULT_LANGUAGE]?.[key] || keyOrMessage;
};

module.exports = {
  DEFAULT_LANGUAGE,
  supportedLanguages,
  detectRequestLanguage,
  getSupportedLanguage,
  translate,
};
