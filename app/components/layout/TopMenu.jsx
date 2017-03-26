import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

// Use named export for unconnected component (for tests)
export class TopMenu extends Component {

  static propTypes = {
    builder: PropTypes.func.isRequired,
    loggedIn: PropTypes.bool.isRequired
  };

  constructor() {
    super();
    console.log('constructor');
  }

  render() {
    console.log('render');
    return this.props.builder(this.props.loggedIn,
      this.props.menu,
      this.props.onClick,
      this.props.workspaceList,
      this.props.menuOnClickHandler,
      this.props.translation.languageList);
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
