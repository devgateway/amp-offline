import React, { PropTypes } from 'react';
import translate from '../../utils/translate';

export default class Span extends React.Component {

  static propTypes = {
    className: PropTypes.func,
    text: PropTypes.string
  };

  render() {
    return <span className={this.props.className}>{translate(this.props.text)}</span>;
  }
}
