/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import Moment from 'moment';
import { FormControl } from 'react-bootstrap';
import DateUtils from '../../../../utils/DateUtils';
import Logger from '../../../../modules/util/LoggerManager';
import translate from '../../../../utils/translate';

const logger = new Logger('AF date year');

export default class AFDateYear extends Component {

  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    extraParams: PropTypes.object,
    range: PropTypes.number,
    isFiscalCalendar: PropTypes.bool,
    convert: PropTypes.func
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.state = { value: props.value };
  }

  onDateChange(date: Moment) {
    this.handleChange(date, date ? DateUtils.getISODateForAPI(date) : null);
  }

  handleChange(date, value) {
    if (this.props.convert) {
      this.props.convert(date, value);
    }
    if (this.props.onChange) {
      this.props.onChange(value);
    }
    this.setState({
      value,
      date
    });
  }

  render() {
    debugger;
    const extraParams = this.props.extraParams || {};
    const defaultOption = <option key={-1} value={-1}>{translate('Choose One')}</option>;
    const options = extraParams.options.map(option =>
      <option key={option} value={option} selected={this.state.value === option}>{option}</option>);
    return (
      <FormControl
        componentClass="select" value={this.state.value} onChange={this.handleChange.bind(this)}
        placeholder={-1}>
        {extraParams.noChooseOneOption ? options : [defaultOption].concat(options)}
      </FormControl>
    );
  }
}
