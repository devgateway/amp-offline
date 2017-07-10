import React, { Component, PropTypes } from 'react';
import { FormControl } from 'react-bootstrap';
import AFOption from './AFOption';
import translate from '../../../../utils/translate';
import LoggerManager from '../../../../modules/util/LoggerManager';

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
    showValueAsLabel: PropTypes.bool
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.state = {
      value: undefined,
      propsRecieved: false
    };
  }

  componentWillMount() {
    this.setState({ value: this.props.selectedId, propsRecieved: true });
  }

  componentDidUpdate(prevProps) {
    if (this.props.options !== prevProps.options) {
      this._checkIfValueChanged(this.state.value);
    }
  }

  handleChange(e) {
    this._handleChange(this._findSelectedOption(e.target.value));
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
    if (!this.state.propsRecieved) {
      return null;
    }
    if (this.props.showValueAsLabel) {
      const option = this.props.options.filter((item) => (
        (item.id === this.props.selectedId || item._id === this.props.selectedId)
      ));
      if (option && option[0]) {
        return <div>{option[0]._value}</div>;
      }
      return null;
    } else {
      const defaultOption = <option key={-1} value={-1} >{translate('Choose One')}</option>;
      const options = this.props.options.map(option =>
        <option key={option.id} value={option.id} >{option.translatedValue}</option>);

      return (
        <FormControl
          componentClass="select" defaultValue={this.state.value} onChange={this.handleChange.bind(this)}
          placeholder={-1} >
          {[defaultOption].concat(options)}
        </FormControl>
      );
    }
  }
}
