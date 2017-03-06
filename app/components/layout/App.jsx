// @flow
import React, { Component, PropTypes } from "react";
import Navbar from "./Navbar";
import styles from "./App.css";
import Footer from "./Footer";

export default class App extends Component {

  constructor() {
    super();
  }

  static propTypes = {
    children: PropTypes.element.isRequired
  };

  static contextTypes = {
    store: React.PropTypes.object.isRequired
  };

  render() {
    console.log('render');

    return (
      <div className={styles.container}>
        <div className={styles.container}>
          <Navbar user={this.props.user} login={this.props.login}
                  workspaceList={this.props.workspace.workspaceList} menuOnClickHandler={this.props.selectWorkspace}
                  translation={this.props.translation}/>
          <div className={styles.content}>
            {this.props.children}
          </div>
        </div>
        <Footer/>
      </div>
    );
  }
}
