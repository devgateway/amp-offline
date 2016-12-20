// @flow
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import MenuUtils from '../../utils/MenuUtils';

class TopMenu extends Component {

  constructor() {
    super();
    console.log('constructor');
  }

  handleClick(info) {
    console.log('handleClick');
    MenuUtils.handleClick(info);
  }

  render() {
    console.log('render');
    return MenuUtils.buildMenu(this.props.login.loggedIn);
  }
}

// We link this component with Redux to detect when the language changes.
const mapStateToProps = (state, props) => {
  console.log('mapStateToProps');
  return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
  console.log('mapDispatchToProps');
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(TopMenu);
