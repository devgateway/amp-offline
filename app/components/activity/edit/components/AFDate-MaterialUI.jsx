/*
 The MIT License (MIT)

 Copyright (c) 2014 Call-Em-All

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
/*
import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Moment from 'moment';
import { DatePicker } from 'material-ui';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { MAX_SUPPORTED_YEAR, MIN_SUPPORTED_YEAR } from '../../../../utils/Constants';
import DateUtils from '../../../../utils/DateUtils';
import LoggerManager from '../../../../modules/util/LoggerManager';


injectTapEventPlugin();

const DateTimeFormat = global.Intl.DateTimeFormat;
*/

/*
 Leaving this Date Picker option for later, when custom calendars or RTL will be needed, since it doesn't fit well
 with our design and UX.
 */

/* eslint-disable class-methods-use-this */

/**
 * Activity Form Date input field using MaterialUI widget, that seems to allow custom calendars and RTL styles:
 * a) custom calendars can be added by configuring "utils" property, e.g. https://goo.gl/YZcZtr
 * b) RTL support https://bitsrc.io/materialui/react-material-ui/styles/rtl
 * @author Nadejda Mandrescu
 */
/*
class AFDateMaterialUI extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    lang: PropTypes.string // eslint-disable-line react/no-unused-prop-types
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.gsDateFormat = DateUtils.getGSDateFormat();
    this.state = {
      value: props.value,
      date: props.value ? Moment(props.value).toDate() : null
    };
  }

  onDateChange(event, date: Date) {
    this.handleChange(date, date ? date.toISOString() : null);
  }

  handleChange(date, value) {
    this.props.onChange(value);
    this.setState({
      value,
      date
    });
  }

  isOutsideRange(date: Date) {
    return date && (date.getFullYear() < MIN_SUPPORTED_YEAR || date.getFullYear() > MAX_SUPPORTED_YEAR);
  }

  render() {
    return (
      <div>
        <MuiThemeProvider>
          <DatePicker
            DateTimeFormat={DateTimeFormat}
            value={this.state.date} onChange={this.onDateChange.bind(this)}
            formatDate={DateUtils.createFormattedDate}
            hintText={this.gsDateFormat} autoOk locale={Moment.locale()}
            shouldDisableDate={this.isOutsideRange.bind(this)} />
        </MuiThemeProvider>
      </div>);
  }
}

export default connect(
  state => ({
    lang: state.translationReducer.lang
  })
)(AFDateMaterialUI);
*/
