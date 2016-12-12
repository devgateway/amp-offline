import React from 'react';
import translate from '../../utils/translate';

export default class Span extends React.Component {

  render() {
    return <span className={this.props.className}>{translate(this.props.text)}</span>
  }
}
