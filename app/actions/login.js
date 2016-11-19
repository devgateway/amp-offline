// @flow
import auth from '../modules/security/Auth'
import {hashHistory} from 'react-router';

export const STATE_LOGIN_OK = 'STATE_LOGIN_OK';
export const STATE_LOGIN_FAIL = 'STATE_LOGIN_FAIL';
export const STATE_LOGOUT = 'STATE_LOGOUT';

export function loginAction(email, password) {
  console.log('actions/login.js - login()');

  //TODO: aca ejecutar la llamada a Auth.login() y segun q devuelva es q devuelvo un type de logueado o un type de fallo.
  //luego para que este completo tengo q soportar un type de ajax-en-curso porque es algo q puede llevar tiempo.
  if (auth.login(email, password)) {
    console.log('Login OK');

    // Tell react-router to move to another page.
    forwardTo('/workspace');

    // Return the action object that will be dispatched on redux.
    return {
      type: STATE_LOGIN_OK,
      actionData: {email: email, password: password}
    };
  } else {
    console.log('Login Fail');
    return {
      type: STATE_LOGIN_FAIL
    };
  }
}

export function logoutAction() {
  console.log('actions/login.js - logout()');
  return {
    type: STATE_LOGOUT
  };
}

/**
 * Forwards the user
 * @param {string} location The route the user should be forwarded to
 */
function forwardTo(location) {
  //TODO: MOVE THIS FUNCTION TO ANOTHER CLASS BECAUSE IT WILL BE USED IN MANY PLACES.
  console.log('forwardTo(' + location + ')');
  hashHistory.push(location);
}
