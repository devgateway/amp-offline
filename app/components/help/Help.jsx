import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Logger from '../../modules/util/LoggerManager';
import translate from '../../utils/translate';

const logger = new Logger('Help Page');

/**
 * Help Page
 *
 * @author ginchauspe
 */
export default class Help extends Component {

  static propTypes = {
    loadHelp: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.state = {
    };
  }

  componentWillMount() {
    this.props.loadHelp();
  }

  componentWillReceiveProps(nextProps) {
  }

  render() {
    return null;
  }
}
