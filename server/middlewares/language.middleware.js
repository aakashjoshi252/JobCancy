const { detectRequestLanguage, translate } = require('../utils/i18n');

const localizeValue = (value, language) => {
  if (typeof value === 'string') return translate(value, language);
  if (Array.isArray(value)) return value.map((item) => localizeValue(item, language));
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      ['message', 'error', 'details'].includes(key) ? localizeValue(entry, language) : entry,
    ])
  );
};

const languageMiddleware = (req, res, next) => {
  req.language = detectRequestLanguage(req);
  res.locals.language = req.language;
  res.t = (keyOrMessage) => translate(keyOrMessage, req.language);
  next();
};

const localizedResponseMiddleware = (_req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    const language = res.locals.language;
    return originalJson(localizeValue(payload, language));
  };

  next();
};

module.exports = {
  languageMiddleware,
  localizedResponseMiddleware,
};
