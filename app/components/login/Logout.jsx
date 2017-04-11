import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import translate from '../../utils/translate';
import { logoutAction } from '../../actions/LoginAction';
import style from '../layout/Navbar.css';
import LoggerManager from '../../modules/util/LoggerManager';

class Logout extends React.Component {

  static propTypes = {
    loggedIn: PropTypes.bool.isRequired
  };

  constructor() {
    super();
  }

  clickLogout() {
    LoggerManager.log('clickLogout');
    this.props.onClickLogout();
  }

  render() {
    LoggerManager.log('render');
    if (this.props.loggedIn) {
      return (
        <div className={style.logout_container}>
          <a className={style.navbar_right_side} href="#"
             onClick={this.clickLogout.bind(this)}>{translate('logoff')} | </a>
        </div>
      );
    } else {
      return null;
    }
  }
}

/* TODO: Check if is possible to move this section with Redux code to a new TranslationContainer. We did it this way
 because we dont have a router on index.js, then we cant load this container automatically. */
const mapStateToProps = (state, props) => {
  LoggerManager.log('mapStateToProps');
  return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
  LoggerManager.log('mapDispatchToProps');
  return {
    onClickLogout: () => {
      dispatch(logoutAction())
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Logout);
