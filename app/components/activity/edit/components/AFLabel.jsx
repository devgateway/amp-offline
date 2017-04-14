import React, { Component, PropTypes } from 'react';
import { ControlLabel, Glyphicon, OverlayTrigger, Tooltip } from 'react-bootstrap';
import * as styles from '../ActivityForm.css';
import LoggerManager from '../../../../modules/util/LoggerManager';

/* eslint-disable class-methods-use-this */

/**
 * A generic Activity Form component
 * @author Nadejda Mandrescu
 */
export default class AFLabel extends Component {

  static propTypes = {
    value: PropTypes.string.isRequired,
    tooltip: PropTypes.string,
    required: PropTypes.bool
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  _renderTooltip() {
    // TODO more on styles/behavior for Iteration 2+
    if (this.props.tooltip) {
      const tooltip = <Tooltip id="tooltip-id">{this.props.tooltip}</Tooltip>;
      return (
        <OverlayTrigger id="overlay-id" placement="right" overlay={tooltip}>
          <Glyphicon glyph="info-sign" />
        </OverlayTrigger>
      );
    }
    return null;
  }

  _renderRequired() {
    if (this.props.required) {
      return <span className={styles.required} >*</span>;
    }
    return null;
  }

  _renderValue() {
    // TODO any special styles
    return <ControlLabel>{this.props.value}</ControlLabel>;
  }

  render() {
    return <span>{this._renderRequired()} {this._renderValue()} {this._renderTooltip()}</span>;
  }

}
