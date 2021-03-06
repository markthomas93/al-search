const browser = require('webextension-polyfill'); // eslint-disable-line

/**
 * Send browser notification.
 */
function create(id: string, message: string) {
  browser.notifications.create(id, {
    type: 'basic',
    title: 'AL Search',
    iconUrl: browser.extension.getURL('img/logo.svg'),
    message,
  });
}

export default {
  create,
};
