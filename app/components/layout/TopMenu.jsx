import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import LoggerManager from '../../modules/util/LoggerManager';

// Use named export for unconnected component (for tests)
export class TopMenu extends Component {

  static propTypes = {
    builder: PropTypes.func.isRequired,
    loggedIn: PropTypes.bool.isRequired
  };

  constructor() {
    super();
    LoggerManager.log('constructor');
  }

  render() {
    LoggerManager.log('render');
    return this.props.builder(this.props.loggedIn,
      this.props.menu,
      this.props.onClick,
      this.props.workspaceList,
      this.props.menuOnClickHandler,
      this.props.languageList);
  }
}

// We link this component with Redux to detect when the language changes.
const mapStateToProps = (state, props) => {
  LoggerManager.log('mapStateToProps');
  return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
  LoggerManager.log('mapDispatchToProps');
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(TopMenu);
