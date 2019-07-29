import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Logger from '../../modules/util/LoggerManager';
import styles from './App.css';
import Footer from './Footer';
import Navbar from './Navbar';
import UpdateTrigger from '../update/UpdateTrigger';
import SettingsTrigger from '../settings/SettingsTrigger';
import { IS_CHECK_URL_CHANGES } from '../../modules/util/ElectronApp';

const logger = new Logger('App(layout)');

export default class App extends Component {

  static propTypes = {
    router: PropTypes.object.isRequired,
    children: PropTypes.element.isRequired,
    selectWorkspace: PropTypes.func.isRequired,
    /* eslint-disable react/forbid-prop-types */
    workspaceReducer: PropTypes.object.isRequired,
    userReducer: PropTypes.object.isRequired,
    loginReducer: PropTypes.object.isRequired,
    translationReducer: PropTypes.object.isRequired,
    /* eslint-enable react/forbid-prop-types */
    /* eslint-disable react/no-unused-prop-types */
    goToPath: PropTypes.func.isRequired,
    appReducer: PropTypes.object.isRequired,
    /* eslint-enable react/no-unused-prop-types */
  };

  static contextTypes = {
    store: React.PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.disableUpdates = +process.env.DISABLE_UPDATE;
    if (this.disableUpdates) {
      logger.warn('AMP Offline upgrade workflow is disabled. This is by default during development.');
    }
    this.isCheckUrlChanges = IS_CHECK_URL_CHANGES;
  }

  componentWillReceiveProps(nextProps) {
    const { appReducer, goToPath } = nextProps;
    if (appReducer.pathToNavigate) {
      goToPath(appReducer.pathToNavigate);
    }
  }

  render() {
    logger.debug('render');

    return (
      <div className={'outerContainer'}>
        <div className={styles.wrap}>
          <div className={styles.header}>
            <Navbar
              userReducer={this.props.userReducer}
              loginReducer={this.props.loginReducer}
              workspaceReducer={this.props.workspaceReducer}
              workspaceList={this.props.workspaceReducer.workspaceList}
              menuOnClickHandler={this.props.selectWorkspace}
              translationReducer={this.props.translationReducer}
            />
          </div>
          <div className={styles.content}>
            {this.props.children}
          </div>
        </div>
        <Footer />
        {!this.disableUpdates && <UpdateTrigger />}
        {this.isCheckUrlChanges && <SettingsTrigger location={this.props.router.location} />}
      </div>
    );
  }
}
