import Auth from '@/anilist/Auth';
import '@/background-scripts/_menus';

const browser = require('webextension-polyfill'); // eslint-disable-line

function handleMessage(request: any, sender: any, sendResponse: any) { // eslint-disable-line
  const auth = new Auth();

  switch (request.code) {
    case 'AUTH_START':
      auth.launch().then((r) => {
        sendResponse({ code: r === true ? 'AUTH_SUCCESS' : 'AUTH_FAILED' });
      });
      break;

    case 'USER_REFRESH':
      auth.refreshUser().then((r) => {
        sendResponse({
          code: r === undefined ? 'USER_REFRESH_SUCCESS' : 'USER_REFRESH_FAILED',
          message: r,
        });
      });
      break;

    case 'USER_LOGOUT':
      auth.logout().then((r) => {
        sendResponse({
          code: r === undefined ? 'USER_LOGOUT_SUCCESS' : 'USER_LOGOUT_FAILED',
          message: r,
        });
      });
      break;

    case 'ACTIVITY_CLEAR':
      browser.storage.local.set({ activity: [] })
        .then(() => {
          sendResponse({ code: 'ACTIVITY_CLEAR_SUCCESS' });
        })
        .catch((e: Error) => {
          sendResponse({
            code: 'ACTIVITY_CLEAR_FAILED',
            message: e.message,
          });
        });
      break;

    default:
      break;
  }

  // Keep listener active to wait for async response.
  return true;
}

browser.runtime.onMessage.addListener(handleMessage);
