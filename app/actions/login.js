// @flow
export const STATE_LOGIN = 'STATE_LOGIN';
export const STATE_LOGOUT = 'STATE_LOGOUT';

export function login() {
  return {
    type: STATE_LOGIN,
    actionData: {}
  };
}

export function logout() {
  return {
    type: STATE_LOGOUT
  };
}
