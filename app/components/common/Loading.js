// @flow
import React, {Component, PropTypes} from 'react';

export default class Loading extends Component {

  constructor() {
    super();
    console.log('loading()');
  }

  render() {
    return (
      <div>
        <span>Loading...</span>
      </div>
    );
  }
}
