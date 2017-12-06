import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { Checkbox } from 'react-bootstrap';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AF checkbox');

/**
 * Activity Form Checkbox component
 * @author Gabriel Inchauspe
 */
export default class AFCheckbox extends Component {
  static propTypes = {
    value: PropTypes.bool,
    onChange: PropTypes.func
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.state = {
      value: ''
    };
  }

  componentWillMount() {
    this.setState({ value: this.props.value || '' });
  }

  handleChange(e) {
    const value = e.target.checked;
    this.props.onChange(value);
    this.setState({ value });
  }

  _getChecked() {
    return (this.state.value === true) ? 'checked' : '';
  }

  render() {
    return (<Checkbox
      value={this.state.value}
      onChange={this.handleChange.bind(this)} checked={this._getChecked()} />);
  }
}
