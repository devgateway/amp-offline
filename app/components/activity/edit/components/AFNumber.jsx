import React, { Component, PropTypes } from 'react';
import { FormControl } from 'react-bootstrap';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Activity Form Text Area component
 * @author Gabriel Inchauspe
 */
export default class AFNumber extends Component {
  static propTypes = {
    value: PropTypes.number,
    maxLength: PropTypes.number,
    onChange: PropTypes.func
    // TODO: Add number check functions.
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.state = {
      value: ''
    };
  }

  componentWillMount() {
    this.setState({ value: this.props.value || '' });
  }

  handleChange(e) {
    let value = e.target.value;
    if (value) {
      if (this.props.maxLength !== undefined && value.length > this.props.maxLength) {
        value = value.substring(0, this.props.maxLength);
      }
    }
    this.props.onChange(value ? value.trim() : value);
    this.setState({ value });
  }

  render() {
    return <FormControl componentClass="input" value={this.state.value} onChange={this.handleChange.bind(this)} />;
  }
}
