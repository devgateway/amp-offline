import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Glyphicon, OverlayTrigger, Tooltip } from 'react-bootstrap';
import * as styles from '../ActivityForm.css';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AF label');

/* eslint-disable class-methods-use-this */

/**
 * A generic Activity Form component
 * @author Nadejda Mandrescu
 */
export default class AFLabel extends Component {

  static propTypes = {
    value: PropTypes.string.isRequired,
    tooltip: PropTypes.string,
    required: PropTypes.bool,
    className: PropTypes.string
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
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
      return <span className={styles.required} />;
    }
    return null;
  }

  _renderValue() {
    return <span className={this.props.className}>{this.props.value}</span>;
  }

  render() {
    return <span>{this._renderRequired()} {this._renderValue()} {this._renderTooltip()}</span>;
  }

}
