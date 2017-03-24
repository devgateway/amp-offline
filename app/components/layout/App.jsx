import React, { Component, PropTypes } from 'react';
import Navbar from './Navbar';
import styles from './App.css';
import Footer from './Footer';

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
    console.log('render');

    return (
      <div className={styles.container}>
        <div className={styles.container}>
          <Navbar
            user={this.props.user} login={this.props.login} workspace={this.props.workspace}
            workspaceList={this.props.workspace.workspaceList} menuOnClickHandler={this.props.selectWorkspace}
            translation={this.props.translation}
          />
          <div className={styles.content}>
            {this.props.children}
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
