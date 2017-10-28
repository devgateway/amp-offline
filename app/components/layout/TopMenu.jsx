import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Top menu');

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
    logger.log('constructor');
  }

  render() {
    logger.log('render');
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
  logger.log('mapStateToProps');
  return state;
};

const mapDispatchToProps = () => {
  logger.log('mapDispatchToProps');
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(TopMenu);
