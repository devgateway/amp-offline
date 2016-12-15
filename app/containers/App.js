// @flow
import React, {Component, PropTypes} from 'react';
import Navbar from '../components/layout/Navbar'

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
    const containerStyle = {
      "margin-top": "60px"
    };
    console.log('render');
    return (
      <div>
        <Navbar user={this.context.store.getState().login}/>
        <div style={containerStyle}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
