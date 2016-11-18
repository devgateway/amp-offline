// @flow
export const STATE_LOGIN = 'STATE_LOGIN';
export const STATE_LOGOUT = 'STATE_LOGOUT';

export function login(data) {
  return {
    type: STATE_LOGIN,
    actionData: data
  };
}

export function logout() {
  return {
    type: STATE_LOGOUT
  };
}
