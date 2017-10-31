import React, { Component, PropTypes } from 'react';
import { FormControl } from 'react-bootstrap';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AF input');

/**
 * Activity Form Text Area component
 * @author ginchauspe
 */
export default class AFInput extends Component {
  static propTypes = {
    value: PropTypes.string,
    maxLength: PropTypes.number,
    onChange: PropTypes.func
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.state = {
      value: null
    };
  }

  componentWillMount() {
    this.setState({ value: this.props.value });
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
    return (<FormControl
      componentClass="input" value={this.state.value} onChange={this.handleChange.bind(this)} />);
  }
}
