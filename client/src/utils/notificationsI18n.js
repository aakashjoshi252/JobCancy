export const getNotificationText = (notification, t) => {
  const variables = notification?.variables || notification?.data || {};
  const type = notification?.type;

  if (type) {
    const titleKey = `types.${type}.title`;
    const messageKey = `types.${type}.message`;
    const translatedTitle = t(titleKey, { ...variables, defaultValue: "" });
    const translatedMessage = t(messageKey, { ...variables, defaultValue: "" });

    if (translatedTitle || translatedMessage) {
      return {
        title: translatedTitle || notification?.title || t("title"),
        message: translatedMessage || notification?.message || "",
      };
    }
  }

  return {
    title: notification?.title || t("title"),
    message: notification?.message || "",
  };
};
