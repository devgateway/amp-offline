import React, { Component, PropTypes } from 'react';
import { FormControl } from 'react-bootstrap';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AF text area');

/**
 * Activity Form Text Area component
 * @author Nadejda Mandrescu
 */
export default class AFTextArea extends Component {
  static propTypes = {
    value: PropTypes.string,
    maxLength: PropTypes.number,
    onChange: PropTypes.func
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.state = {
      value: null
    };
  }

  componentWillMount() {
    this.setState({ value: this.props.value });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value });
  }

  onBlur(e) {
    const value = e.target.value;
    this.props.onChange(value);
  }

  handleChange(e) {
    let value = e.target.value;
    if (value) {
      if (this.props.maxLength !== undefined && value.length > this.props.maxLength) {
        value = value.substring(0, this.props.maxLength);
      }
    }
    this.setState({ value });
  }

  render() {
    return (
      <FormControl
        componentClass="textarea" value={this.state.value} onChange={this.handleChange.bind(this)}
        onBlur={this.onBlur.bind(this)} />
    );
  }
}
