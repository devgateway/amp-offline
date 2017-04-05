import React, { Component, PropTypes } from 'react';
import translate from '../../utils/translate';

export default class WarnMessage extends Component {

  static propTypes = {
    message: PropTypes.string.isRequired
  };

  render() {
    console.log('render');
    return (
      <div className={`alert alert-warning ${(this.props.message === '' ? 'hidden' : '')}`}>
        <strong>{translate('Warning')}: </strong>{this.props.message}
      </div>
    );
  }
}
