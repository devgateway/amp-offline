const Auth = {

  login(email, password) {
    //TODO: what if we use promises instead of a callback?
    if (this.loggedIn()) {
      return true;
    }

    //TODO: implement this function doing a request to AMP EP.
    if (email === 'testuser@amp.org' && password === 'password') {
      localStorage.setItem('token', 'ImLoggedInToken');
      return true;
    } else {
      return false;
    }
  },

  loggedIn() {
    //TODO: Implement more complex token validation scheme with expiration time, multiple users, etc.
    return !!localStorage.token;
  },

  logout() {
    localStorage.removeItem('token');
  }
};

module.exports = Auth;

/* first attempt of async implementation.
const Auth = {

  login(email, password, callback) {
    //TODO: what if we use promises instead of a callback?
    if (this.loggedIn()) {
      callback(true);
      return;
    }

    //TODO: implement this function doing a request to AMP EP.
    if (email === 'testuser@amp.org' && password === 'password') {
      localStorage.setItem('token', 'ImLoggedInToken');
      callback(true);
    } else {
      callback(false);
    }
  },

  loggedIn() {
    //TODO: Implement more complex token validation scheme with expiration time, multiple users, etc.
    return !!localStorage.token;
  },

  logout() {
    localStorage.removeItem('token');
  }
};

module.exports = Auth;
*/
