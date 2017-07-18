import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import { SingleDatePicker } from 'react-dates';
import { MIN_SUPPORTED_YEAR, MAX_SUPPORTED_YEAR } from '../../../../utils/Constants';
import DateUtils from '../../../../utils/DateUtils';
import LoggerManager from '../../../../modules/util/LoggerManager';

/* eslint-disable class-methods-use-this */

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
    this.gsDateFormat = DateUtils.getGSDateFormat();
    this.state = {
      value: props.value,
      rawValue: props.value,
      date: props.value ? Moment(props.value) : null,
      focused: false
    };
  }

  onFocusChange({ focused }) {
    if (!focused) {
      const rawValue = this.state.rawValue || null;
      let value = null;
      let date = Moment(rawValue, this.gsDateFormat);
      if (!date.isValid()) {
        date = null;
      } else {
        value = date.toISOString();
      }
      this.handleChange(date, value, rawValue);
    }
    this.setState({ focused });
  }

  onDateChange(date: Moment) {
    this.handleChange(date, date ? date.toISOString() : null, date ? date.format(this.gsDateFormat) : null);
  }

  handleChange(date, value, rawValue) {
    this.props.onChange(value);
    this.setState({
      value,
      date,
      rawValue
    });
  }

  handleInputChange(e) {
    const rawValue = e.target.value;
    this.setState({ rawValue });
  }

  isOutsideRange(date: Moment) {
    return date.year() < MIN_SUPPORTED_YEAR || date.year() > MAX_SUPPORTED_YEAR;
  }

  render() {
    return (
      <div onChange={this.handleInputChange.bind(this)}>
        <SingleDatePicker
          date={this.state.date} onDateChange={this.onDateChange.bind(this)} displayFormat={this.gsDateFormat}
          placeholder={this.gsDateFormat} showClearDate showDefaultInputIcon numberOfMonths={1} daySize={35}
          hideKeyboardShortcutsPanel isOutsideRange={this.isOutsideRange.bind(this)}
          focused={this.state.focused} onFocusChange={this.onFocusChange.bind(this)} />
      </div>);
  }
}
