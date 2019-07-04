import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import AmpTooltip from './AmpTooltip';
import * as styles from './CommonStyles.css';

/**
 * Displays an info icon with a tooltip
 *
 * @author Nadejda Mandrescu
 */
export default class InfoTooltip extends Component {
  static propTypes = {
    tooltip: PropTypes.string.isRequired,
    superscript: PropTypes.bool,
  };

  static defaultProps = {
    superscript: true,
  };

  render() {
    const infoIcon = <Glyphicon glyph="info-sign" className={styles.blue} />;
    const tooltipEl = <AmpTooltip tooltip={this.props.tooltip} placement="top" content={infoIcon} />;
    return this.props.superscript ? <sup>{tooltipEl}</sup> : tooltipEl;
  }
}
