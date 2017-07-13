import React, { Component, PropTypes } from 'react';
import { FormControl } from 'react-bootstrap';
import LoggerManager from '../../../../modules/util/LoggerManager';
import { createFormattedDate } from '../../../../utils/DateUtils';

/**
 * Activity Form Date component
 * @author Gabriel Inchauspe
 */
export default class AFDate extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func
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
    const value = e.target.value;
    this.props.onChange(value);
    this.setState({ value });
  }

  render() {
    // TODO: show a datepicker that can accept the date format from GS.
    return (<FormControl
      componentClass="input" value={createFormattedDate(this.state.value)}
      onChange={this.handleChange.bind(this)} />);
  }
}
