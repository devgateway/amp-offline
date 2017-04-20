import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../modules/util/LoggerManager';
import styles from './App.css';
import Footer from './Footer';
import Navbar from './Navbar';

export default class App extends Component {

  static propTypes = {
    children: PropTypes.element.isRequired,
    selectWorkspace: PropTypes.func.isRequired,
    /* eslint-disable react/forbid-prop-types */
    workspace: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    login: PropTypes.object.isRequired,
    translation: PropTypes.object.isRequired
    /* eslint-enable react/forbid-prop-types */
  };

  static contextTypes = {
    store: React.PropTypes.object.isRequired
  };

  render() {
    LoggerManager.log('render');


    return (
      <div className={'outerContainer'}>
        <div className={styles.wrap}>
          <div className={styles.header}><Navbar
            user={this.props.user} login={this.props.login} workspace={this.props.workspace}
            workspaceList={this.props.workspace.workspaceList} menuOnClickHandler={this.props.selectWorkspace}
            translation={this.props.translation}
          />
          </div>
          <div className={styles.content}>
            {this.props.children}
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
