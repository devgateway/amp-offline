import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'react-bootstrap';
import { FieldPathConstants } from 'amp-ui';
import AFOption from './AFOption';
import translate from '../../../../utils/translate';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AF Dropdown');

/**
 * Activity Form dropdown component
 * @author Nadejda Mandrescu
 */
export default class AFDropDown extends Component {

  static propTypes = {
    options: PropTypes.arrayOf(PropTypes.instanceOf(AFOption)).isRequired,
    // TODO change it to be only number once we fix possible values to provide ids only as numbers
    selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    defaultValueAsEmptyObject: PropTypes.bool,
    extraParams: PropTypes.object
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.state = {
      value: undefined,
      propsReceived: false
    };
  }

  componentWillMount() {
    this.setState({ value: this.props.selectedId, propsReceived: true });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.selectedId });
  }

  componentDidUpdate(prevProps) {
    if (this.props.options !== prevProps.options) {
      this._checkIfValueChanged(this.state.value);
    }
  }

  handleChange(e) {
    let value = this._findSelectedOption(e.target.value);
    if (this.props.defaultValueAsEmptyObject === true && value === undefined) {
      value = {};
    }
    this._handleChange(value);
  }

  _findSelectedOption(value) {
    return this.props.options.find(o => `${o.id}` === `${value}`);
  }

  _checkIfValueChanged(value) {
    const selectedOption = this._findSelectedOption(value);
    if ((selectedOption === undefined && this.state.value) || (selectedOption && !this.state.value)) {
      this._handleChange(selectedOption);
    }
  }

  _handleChange(selectedOption) {
    this.props.onChange(selectedOption);
    this.setState({ value: selectedOption ? selectedOption.id : selectedOption });
  }

  render() {
    const extraParams = this.props.extraParams || {};
    if (!this.state.propsReceived) {
      return null;
    }
    const defaultOption = <option key={-1} value={-1}>{translate('Choose One')}</option>;
    const options = this.props.options.map(option => {
      const isDisabled = option[FieldPathConstants.FIELD_OPTION_USABLE] !== undefined &&
        !option[FieldPathConstants.FIELD_OPTION_USABLE];
      const displayValue = extraParams.showOrigValue ? option.value : option.translatedValue;
      return <option key={option.id} value={option.id} disabled={isDisabled}>{displayValue}</option>;
    });

    const value = this.state.value || '';

    return (
      <FormControl
        componentClass="select" value={value} onChange={this.handleChange.bind(this)}
        placeholder={-1}>
        {extraParams.noChooseOneOption ? options : [defaultOption].concat(options)}
      </FormControl>
    );
  }
}
