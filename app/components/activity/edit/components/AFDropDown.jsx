import React, { Component, PropTypes } from 'react';
import { FormControl } from 'react-bootstrap';
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
    defaultValueAsEmptyObject: PropTypes.bool
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
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
    if (!this.state.propsReceived) {
      return null;
    }
    const defaultOption = <option key={-1} value={-1}>{translate('Choose One')}</option>;
    const options = this.props.options.map(option =>
      <option key={option.id} value={option.id}>{option.translatedValue}</option>);

    return (
      <FormControl
        componentClass="select" value={this.state.value} onChange={this.handleChange.bind(this)}
        placeholder={-1}>
        {[defaultOption].concat(options)}
      </FormControl>
    );
  }
}
