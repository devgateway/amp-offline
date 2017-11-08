import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Logger from '../../modules/util/LoggerManager';
import * as Utils from '../../utils/Utils';

const logger = new Logger('AmpTooltip');

/**
 * A generic tooltip
 *
 * @author Nadejda Mandrescu
 */
export default class AmpTooltip extends Component {
  static propTypes = {
    id: PropTypes.string,
    tooltip: PropTypes.string.isRequired,
    content: PropTypes.any.isRequired,
    placement: PropTypes.string,
    className: PropTypes.string
  };

  static defaultProps = {
    id: Utils.stringToUniqueId(''),
    placement: 'left'
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.state = {};
  }

  render() {
    const { id, tooltip, content, className, placement } = this.props;
    const tooltipElement = <Tooltip id={id}>{tooltip}</Tooltip>;
    return (<OverlayTrigger placement={placement} overlay={tooltipElement}>
      <span className={className}>
        {content}
      </span>
    </OverlayTrigger>);
  }
}