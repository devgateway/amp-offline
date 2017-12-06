import React, { Component, PropTypes } from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import translate from '../../../../utils/translate';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AP Label');

export default class APLabel extends Component {

  static propTypes = {
    label: PropTypes.string.isRequired,
    dontTranslate: PropTypes.bool,
    labelClass: PropTypes.string,
    /* decorator: PropTypes.func, // TODO: To be implemented. */
    separator: PropTypes.bool,
    tooltip: PropTypes.string
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  getContent() {
    const label = (this.props.dontTranslate === true ? this.props.label : translate(this.props.label));
    const labelClass = (this.props.labelClass ? this.props.labelClass : '');
    return (<div className={labelClass} ><span>{label}</span>{this.props.separator ? <hr /> : ''}</div>);
  }

  tooltip() {
    return <Tooltip id="tooltip" >{translate(this.props.tooltip)}</Tooltip>;
  }

  render() {
    if (this.props.tooltip) {
      return (<OverlayTrigger placement="right" overlay={this.tooltip()} >
        {this.getContent()}
      </OverlayTrigger>);
    } else {
      return this.getContent();
    }
  }
}
