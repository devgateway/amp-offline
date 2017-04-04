import React, { Component, PropTypes } from 'react';
import translate from '../../utils/translate';

export default class Button extends Component {
  static propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    text: PropTypes.string
  };

  render() {
    return (
      <button
        type="button" className={this.props.className} onClick={() => { this.props.onClick(); }}
      >{translate(this.props.text)}</button>);
  }
}
