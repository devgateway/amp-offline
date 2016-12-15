import React from 'react';
import translate from '../../utils/translate';

export default class Button extends React.Component {

  render() {
    return <button type="button" className={this.props.className}
                   onClick={() => {this.props.onClick();}}>{translate(this.props.text)}</button>
  }
}
