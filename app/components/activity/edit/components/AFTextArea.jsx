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
    return <FormControl componentClass="textarea" value={this.state.value} onChange={this.handleChange.bind(this)} />;
  }
}
