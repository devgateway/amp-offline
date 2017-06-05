import React, { Component, PropTypes } from 'react';
import translate from '../../../../utils/translate';
import LoggerManager from '../../../../modules/util/LoggerManager';

export default class APLabel extends Component {

  static propTypes = {
    label: PropTypes.string.isRequired,
    dontTranslate: PropTypes.bool,
    labelClass: PropTypes.string,
    decorator: PropTypes.func, // TODO: To be implemented.
    separator: PropTypes.bool
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    const label = (this.props.dontTranslate === true ? this.props.label : translate(this.props.label));
    const labelClass = (this.props.labelClass ? this.props.labelClass : '');
    const component = (<div className={labelClass}><span>{label}</span>{this.props.separator ? <hr /> : ''}</div>);
    return component;
  }
}
