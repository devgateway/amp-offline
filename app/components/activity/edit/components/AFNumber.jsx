import React, { Component, PropTypes } from 'react';
import { FormControl } from 'react-bootstrap';
import LoggerManager from '../../../../modules/util/LoggerManager';
import translate from '../../../../utils/translate';

/**
 * Activity Form Number component
 * @author Gabriel Inchauspe
 */
export default class AFNumber extends Component {
  static propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    max: PropTypes.number,
    min: PropTypes.number,
    onChange: PropTypes.func,
    readonly: PropTypes.bool
    // TODO: Add number check functions.
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

  validate(value) {
    let validationError = null;
    if (value) {
      const auxValue = Number(value);
      // TODO move it to ActivityValidator._validateValue once we have API restrictions
      if (this.props.max !== undefined && auxValue > this.props.max) {
        validationError = `${translate('Number is bigger than')} ${this.props.max}`;
      }
      if (this.props.min !== undefined && auxValue < this.props.min) {
        validationError = `${translate('Number is smaller than')} ${this.props.min}`;
      }
    }
    return validationError;
  }

  handleChange(e) {
    // TODO: I think keep in a variable the string representation of the number (according to current GS) along with
    // the numeric value.
    const value = e.target.value;
    const validationError = this.validate(value);
    this.props.onChange(value, null, validationError);
    this.setState({ value });
  }

  render() {
    return (<FormControl
      componentClass="input" value={this.state.value} onChange={this.handleChange.bind(this)}
      disabled={this.props.readonly || false} />);
  }
}
