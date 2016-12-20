// @flow
import React, {Component, PropTypes} from 'react';
import Navbar from '../components/layout/Navbar';
import styles from './App.css';
import Footer from '../components/layout/Footer'

export default class App extends Component {

  constructor(props, context) {
    // This is a bit anti-pattern but still valid when you need Redux store
    // without having to connect the component (https://github.com/reactjs/react-redux/issues/108).
    // NOT for being used everywhere.
    super(props, context);
    console.log("context", this.context);
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
          <Navbar user={this.context.store.getState().login}/>
          <div className={styles.content}>
            {this.props.children}
          </div>
        </div>
        <Footer/>
      </div>
    );
  }
}
