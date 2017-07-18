import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Moment from 'moment';
import { DatePicker, LocaleProvider } from 'antd';
import * as ADLocales from './AntDesignLocales';
import { MIN_SUPPORTED_YEAR, MAX_SUPPORTED_YEAR } from '../../../../utils/Constants';
import DateUtils from '../../../../utils/DateUtils';
import LoggerManager from '../../../../modules/util/LoggerManager';

/* eslint-disable class-methods-use-this */

/**
 * Activity Form Date input field using AntDesign widget
 * @author Nadejda Mandrescu
 */
class AFDateAntDesign extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    lang: PropTypes.string
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.gsDateFormat = DateUtils.getGSDateFormat();
    this.state = {
      value: props.value,
      date: props.value ? Moment(props.value) : null
    };
  }

  onDateChange(date: Moment) {
    this.handleChange(date, date ? date.toISOString() : null);
  }

  handleChange(date, value) {
    this.props.onChange(value);
    this.setState({
      value,
      date
    });
  }

  isOutsideRange(date: Moment) {
    return date && (date.year() < MIN_SUPPORTED_YEAR || date.year() > MAX_SUPPORTED_YEAR);
  }

  render() {
    return (
      <div>
        <LocaleProvider locale={ADLocales[this.props.lang]} >
          <DatePicker
            value={this.state.date} onChange={this.onDateChange.bind(this)} format={this.gsDateFormat}
            placeholder={this.gsDateFormat} allowClear showToday
            disabledDate={this.isOutsideRange.bind(this)} />
        </LocaleProvider>
      </div>);
  }
}

export default connect(
  state => ({
    lang: state.translationReducer.lang
  })
)(AFDateAntDesign);
