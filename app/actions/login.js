// @flow
import auth from '../modules/security/Auth'
import urlUtils from '../utils/urlUtils'

export const STATE_LOGIN_OK = 'STATE_LOGIN_OK';
export const STATE_LOGIN_FAIL = 'STATE_LOGIN_FAIL';
export const STATE_LOGOUT = 'STATE_LOGOUT';
export const STATE_LOGIN_PROCESSING = 'STATE_LOGIN_PROCESSING';

export function loginAction(email, password) {
  return (dispatch) => {
    console.log('actions/login.js - login()');

    //TODO: aca ejecutar la llamada a Auth.login() y segun q devuelva es q devuelvo un type de logueado o un type de fallo.
    //luego para que este completo tengo q soportar un type de ajax-en-curso porque es algo q puede llevar tiempo.
    auth.login(email, password, (success, err) => {
      if (success === true) {
        // Tell react-router to move to another page.
        urlUtils.forwardTo('/workspace'); //TODO: use a constants file for all urls.
        // Return the action object that will be dispatched on redux (it can be done manually with dispatch() too).
        dispatch(loginOk(email, password));
      } else {
        dispatch(loginFailed(err));
      }
    });

    dispatch(sendingRequest());
  }
}

export function loginOk(email, password) {
  console.log('Login OK');
  return { //TODO: esto tien q ser dispatcheado no returneado sino no se toma como un cambio de estado de redux.
    type: STATE_LOGIN_OK,
    actionData: {email: email, password: password}
  };
}

export function loginFailed(err) {
  console.log('Login Fail');
  return {
    type: STATE_LOGIN_FAIL,
    actionData: {errorMessage: err}
  };
}

export function sendingRequest() {
  console.log('Login processing...');
  return {
    type: STATE_LOGIN_PROCESSING
  }
}

export function logoutAction() {
  console.log('actions/login.js - logout()');
  return {
    type: STATE_LOGOUT
  };
}
