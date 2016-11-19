const Auth = {

  login(email, password, callback) {
    //TODO: what if we use promises instead of a callback?
    if (this.loggedIn()) {
      callback(true);
      return;
    }

    //TODO: implement this function doing a request to AMP EP.
    setTimeout(function () {
      if (email === 'testuser@amp.org' && password === 'password') {
        localStorage.setItem('token', 'ImLoggedInToken');
        callback(true);
      } else {
        callback(false);
      }
    }, 2000);//simulating the lag from server.
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
