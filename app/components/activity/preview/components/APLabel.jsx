import { Component, PropTypes } from 'react';
import translate from '../../../../utils/translate';
import LoggerManager from '../../../../modules/util/LoggerManager';
import style from './APLabel.css';

export default class APLabel extends Component {

  static propTypes = {
    label: PropTypes.string.isRequired,
    dontTranslate: PropTypes.bool,
    labelClass: PropTypes.string,
    decorator: PropTypes.func // TODO: To be implemented.
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    const label = (this.props.dontTranslate === true ? this.props.label : translate(this.props.label));
    const labelClass = (this.props.labelClass ? this.props.labelClass : '');
    const component = (`<div class='${labelClass}'><span className=${style.label}>${label}</span></div>`);
    return component;
  }
}
