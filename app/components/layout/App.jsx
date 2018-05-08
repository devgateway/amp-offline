import React, { Component, PropTypes } from 'react';
import Logger from '../../modules/util/LoggerManager';
import styles from './App.css';
import Footer from './Footer';
import Navbar from './Navbar';
import UpdateTrigger from '../update/UpdateTrigger';

const logger = new Logger('App(layout)');

export default class App extends Component {

  static propTypes = {
    children: PropTypes.element.isRequired,
    selectWorkspace: PropTypes.func.isRequired,
    /* eslint-disable react/forbid-prop-types */
    workspaceReducer: PropTypes.object.isRequired,
    userReducer: PropTypes.object.isRequired,
    loginReducer: PropTypes.object.isRequired,
    translationReducer: PropTypes.object.isRequired
    /* eslint-enable react/forbid-prop-types */
  };

  static contextTypes = {
    store: React.PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.disableUpdates = +process.env.DISABLE_UPDATE;
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
      </div>
    );
  }
}
