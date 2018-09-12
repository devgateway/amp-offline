/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { FormControl } from 'react-bootstrap';
import Moment from 'moment';
import Logger from '../../../../modules/util/LoggerManager';
import translate from '../../../../utils/translate';
import DateUtils from '../../../../utils/DateUtils';

const logger = new Logger('AF date year');

export default class AFDateYear extends Component {

  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    extraParams: PropTypes.object,
    options: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.state = { value: props.value };
  }

  handleChange(control) {
    const format = DateUtils.getGSDateFormat().toUpperCase();
    const value = Moment(`01/01/${control.target.value}`).format(format);
    if (this.props.onChange) {
      this.props.onChange(value);
    }
    this.setState({
      value
    });
  }

  render() {
    const { extraParams, options } = this.props;
    const defaultOption = <option key={-1} value={-1}>{translate('Choose One')}</option>;
    /* TODO: Once we sync calendars data we can safely know the year for a given date (because a fiscal calendar can
    start on any day/month. */
    const defaultValue = Moment(this.state.value).year();
    const years = options.map(option => {
      const label = extraParams.isFiscalCalendar ? `${option} / ${option + 1}` : option;
      return <option key={option} value={option}>{label}</option>;
    });
    return (
      <FormControl
        componentClass="select" value={defaultValue} onChange={this.handleChange.bind(this)}
        placeholder={-1}>
        {extraParams.noChooseOneOption ? years : [defaultOption].concat(years)}
      </FormControl>
    );
  }
}
