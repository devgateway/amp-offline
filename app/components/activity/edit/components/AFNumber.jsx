import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'react-bootstrap';
import Logger from '../../../../modules/util/LoggerManager';
import translate from '../../../../utils/translate';
import NumberUtils from '../../../../utils/NumberUtils';

const logger = new Logger('AF number');

/**
 * Activity Form Number component
 * @author Gabriel Inchauspe
 */
export default class AFNumber extends Component {
  static propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    extraParams: PropTypes.object
    // TODO: Add number check functions.
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.state = {
      value: undefined
    };
  }

  componentWillMount() {
    let { value } = this.props;
    // in case it was an invalid value configured, we'll try to parse it or set as NaN
    const valueAsNumber = typeof value === 'string' ? NumberUtils.formattedStringToRawNumberOrNaN(value) : value;
    if (!Number.isNaN(valueAsNumber)) {
      if (value || value === 0) {
        value = NumberUtils.rawNumberToFormattedString(valueAsNumber);
      } else {
        value = '';
      }
    }
    this.setState({
      valueAsNumber,
      value
    });
  }

  validate(value) {
    const params = this.props.extraParams || {};
    let validationError = null;
    if (value) {
      const auxValue = Number(value);
      if (!Number.isNaN(auxValue)) {
        // TODO move it to ActivityValidator._validateValue once we have API restrictions. See AMPOFFLINE-1043.
        if (params.smaller !== undefined && !(auxValue < params.smaller)) {
          validationError = `${translate('Number has to be smaller than')} ${params.smaller}`;
        }
        if (params.smallerOrEqual !== undefined && !(auxValue <= params.smallerOrEqual)) {
          validationError = `${translate('Number has to be smaller or equal than')} ${params.smallerOrEqual}`;
        }
        if (params.bigger !== undefined && !(auxValue > params.bigger)) {
          validationError = `${translate('Number has to be bigger than')} ${params.bigger}`;
        }
        if (params.biggerOrEqual !== undefined && !(auxValue >= params.biggerOrEqual)) {
          validationError = `${translate('Number has to be bigger or equal than')} ${params.biggerOrEqual}`;
        }
      }
    }
    return validationError;
  }

  handleChange(e, propagateChange) {
    // TODO: I think keep in a variable the string representation of the number (according to current GS) along with
    // the numeric value.
    let value = e.target.value;
    value = value && value.trim();
    const validationError = this.validate(value);
    const valueAsNumber = value === null || value === undefined || value === '' ? null :
      NumberUtils.formattedStringToRawNumberOrNaN(value);
    if (propagateChange) {
      this.props.onChange(Number.isNaN(valueAsNumber) ? value : valueAsNumber, null, validationError);
    }
    this.setState({
      valueAsNumber,
      value: e.target.value
    });
  }

  handleBlur(e) {
    /* See AMPOFFLINE-1043: The problem with on field validations is we cant prevent the user from leaving the control,
    so in case of validation of "bigger" that wont be enforced on EntityValidator and the user could save bad data,
    so we clear the control when leaving. */
    if (this.validate(this.state.value)) {
      e.target.value = '';
    }
    if (!Number.isNaN(this.state.valueAsNumber)) {
      e.target.value = NumberUtils.rawNumberToFormattedString(this.state.valueAsNumber);
    }
    this.handleChange(e, true);
  }

  render() {
    const params = this.props.extraParams || {};
    return (<FormControl
      componentClass="input" value={this.state.value} onChange={this.handleChange.bind(this)}
      disabled={params.readonly || false} onBlur={this.handleBlur.bind(this)} />);
  }
}
