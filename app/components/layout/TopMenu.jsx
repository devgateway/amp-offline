import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import LoggerManager from '../../modules/util/LoggerManager';

// Use named export for unconnected component (for tests)
export class TopMenu extends Component {

  static propTypes = {
    builder: PropTypes.func.isRequired,
    loggedIn: PropTypes.bool.isRequired,
    menu: PropTypes.object,
    onClick: PropTypes.func,
    workspaceReducer: PropTypes.object,
    menuOnClickHandler: PropTypes.func,
    languageList: PropTypes.array
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
      this.props.workspaceReducer,
      this.props.menuOnClickHandler,
      this.props.languageList);
  }
}

// We link this component with Redux to detect when the language changes.
const mapStateToProps = (state) => {
  LoggerManager.log('mapStateToProps');
  return state;
};

const mapDispatchToProps = () => {
  LoggerManager.log('mapDispatchToProps');
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(TopMenu);
