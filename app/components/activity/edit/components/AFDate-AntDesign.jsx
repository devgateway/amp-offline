/*
 MIT LICENSE

 Copyright (c) 2015-present Alipay.com, https://www.alipay.com/

 Permission is hereby granted, free of charge, to any person obtaining
 a copy of this software and associated documentation files (the
 "Software"), to deal in the Software without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of the Software, and to
 permit persons to whom the Software is furnished to do so, subject to
 the following conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Moment from 'moment';
import { DatePicker, LocaleProvider } from 'antd';
import * as ADLocales from './AntDesignLocales';
import { MIN_SUPPORTED_YEAR, MAX_SUPPORTED_YEAR } from '../../../../utils/Constants';
import DateUtils from '../../../../utils/DateUtils';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AF date and design');

/* eslint-disable class-methods-use-this */

/**
 * We have an alternative AFDate-MaterialUI implementation that can be extended to use RTL and custom calendars,
 * but so far sticking to this one, since its UX & UI is more appropriate.
 */

/**
 * Activity Form Date input field using AntDesign widget
 * @author Nadejda Mandrescu
 */
class AFDateAntDesign extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    lang: PropTypes.string,
    extraParams: PropTypes.object
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.gsDateFormat = DateUtils.getGSDateFormat();
    this.state = {
      value: props.value,
      date: props.value ? Moment(props.value) : props.value
    };
  }

  componentWillMount() {
    const { todayAsDefaultDate } = this.props.extraParams || {};
    if (todayAsDefaultDate && this.state.date === undefined) {
      this.onDateChange(Moment());
    }
  }

  onDateChange(date: Moment) {
    this.handleChange(date, date ? DateUtils.formatDateForAPI(date) : null);
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
        <LocaleProvider locale={ADLocales[this.props.lang]}>
          <DatePicker
            value={this.state.date} onChange={this.onDateChange.bind(this)} format={this.gsDateFormat}
            placeholder={this.gsDateFormat} allowClear showToday size={'large'}
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
