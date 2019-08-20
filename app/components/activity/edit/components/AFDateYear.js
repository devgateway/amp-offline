/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { FormControl } from 'react-bootstrap';
import Moment from 'moment';
import Logger from '../../../../modules/util/LoggerManager';
import translate from '../../../../utils/translate';
import DateUtils from '../../../../utils/DateUtils';
import { START_DAY_NUMBER, START_MONTH_NUMBER } from '../../../../utils/constants/CalendarConstants';

const logger = new Logger('AF date year');

export default class AFDateYear extends Component {

  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    extraParams: PropTypes.object,
    options: PropTypes.array.isRequired,
    calendar: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.state = { value: props.value };
  }

  handleChange(control) {
    let value = null;
    const { calendar, onChange } = this.props;
    if (control.target.value !== '-1') {
      const day = calendar[START_DAY_NUMBER];
      const month = calendar[START_MONTH_NUMBER];
      value = DateUtils.formatDateForAPI(Moment(`${control.target.value}-${month}-${day}`));
    }
    if (onChange) {
      onChange(value);
    }
    this.setState({
      value
    });
  }

  render() {
    const { extraParams, options } = this.props;
    const defaultOption = <option key={-1} value={-1}>{translate('Choose One')}</option>;
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
