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
    selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired
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

  handleChange(e) {
    const value = e.target.value;
    const selectedOption = this.props.options.find(o => `${o.id}` === value);
    this.props.onChange(selectedOption);
    this.setState({ value });
  }

  render() {
    if (!this.state.propsRecieved) {
      return null;
    }
    const defaultOption = <option key={-1} value={-1}>{translate('Choose One')}</option>;
    const options = this.props.options.map(option => <option key={option.id} value={option.id}>{option.value}</option>);

    return (
      <FormControl
        componentClass="select" defaultValue={this.state.value} onChange={this.handleChange.bind(this)}
        placeholder={-1}>
        {[defaultOption].concat(options)}
      </FormControl>
    );
  }

}
