// @flow
import React, {Component, PropTypes} from 'react';
import Navbar from '../components/layout/Navbar'

export default class App extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired
  };

  render() {
    return (
      <div>
        <Navbar/>
        <div>
          {this.props.children}
        </div>
      </div>
    );
  }
}
