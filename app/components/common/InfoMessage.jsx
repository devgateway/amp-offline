import React, { Component, PropTypes } from 'react';
import { Alert, Fade } from 'react-bootstrap';
import LoggerManager from '../../modules/util/LoggerManager';

/**
 * Simple Info Message
 * @author Nadejda Mandrescu
 */
export default class InfoMessage extends Component {

  static propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf('success', 'info')
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.state = {
      show: false
    };
  }

  componentWillMount() {
    this.setSate({ show: true });
    // TODO in alerts & notifications ticket more behavior, styles, etc
    setTimeout(() => this.setState({ show: false }), 10000);
  }

  close() {
    this.setState({ show: false });
  }

  render() {
    if (this.state.show === false) {
      return null;
    }
    const type = this.props.type || 'info';
    return <Fade in={this.state.show}><Alert bsStyle={type}>{this.props.message}</Alert></Fade>;
  }

}
