// @flow
export const STATE_LOGIN = 'STATE_LOGIN';
export const STATE_LOGOUT = 'STATE_LOGOUT';

export function login(data) {
  console.log('actions/login.js - login()');
  return {
    type: STATE_LOGIN,
    actionData: data
  };
}

export function logout() {
  console.log('actions/login.js - logout()');
  return {
    type: STATE_LOGOUT
  };
}
