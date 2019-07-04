import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert, Fade } from 'react-bootstrap';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Info message');

/**
 * Simple Info Message
 * @author Nadejda Mandrescu
 */
export default class InfoMessage extends Component {
  static propTypes = {
    message: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
    type: PropTypes.oneOf(['success', 'info']),
    timeout: PropTypes.number
  };

  static defaultProps = {
    timeout: 10000, // pass 0 to prevent the message from fading
    type: 'info'
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.state = {
      show: true
    };
  }

  componentWillMount() {
    const { timeout } = this.props;
    if (timeout !== 0) {
      setTimeout(() => {
        if (this.unmounted !== true) {
          this.setState({ show: false });
        }
      }, timeout);
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  close() {
    this.setState({ show: false });
  }

  render() {
    const { show } = this.state;
    const { type, message } = this.props;
    if (!show) return null;
    return (
      <Fade in={show}>
        <Alert bsStyle={type}>{message}</Alert>
      </Fade>
    );
  }

}
