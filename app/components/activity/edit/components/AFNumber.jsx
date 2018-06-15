import React, { Component, PropTypes } from 'react';
import { FormControl } from 'react-bootstrap';
import Logger from '../../../../modules/util/LoggerManager';
import translate from '../../../../utils/translate';

const logger = new Logger('AF number');

/**
 * Activity Form Number component
 * @author Gabriel Inchauspe
 */
export default class AFNumber extends Component {
  static propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    readonly: PropTypes.bool,
    extraParams: PropTypes.object
    // TODO: Add number check functions.
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.state = {
      value: undefined
    };
  }

  componentWillMount() {
    this.setState({ value: this.props.value });
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
    const valueAsNumber = value === null || value === undefined || value === '' ? null : Number(value);
    if (propagateChange) {
      this.props.onChange(valueAsNumber, null, validationError);
    }
    this.setState({ value });
  }

  handleBlur(e) {
    /* See AMPOFFLINE-1043: The problem with on field validations is we cant prevent the user from leaving the control,
    so in case of validation of "bigger" that wont be enforced on EntityValidator and the user could save bad data,
    so we clear the control when leaving. */
    if (this.validate(this.state.value)) {
      e.target.value = '';
    }
    this.handleChange(e, true);
  }

  render() {
    return (<FormControl
      componentClass="input" value={this.state.value} onChange={this.handleChange.bind(this)}
      disabled={this.props.readonly || false} onBlur={this.handleBlur.bind(this)} />);
  }
}
