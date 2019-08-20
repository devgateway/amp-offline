import React from 'react';
import { FormControl } from 'react-bootstrap';
import AFTextArea from './AFTextArea';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AF input');

/**
 * Activity Form Text Area component
 * @author ginchauspe
 */
export default class AFInput extends AFTextArea {

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.state = {
      value: ''
    };
  }

  render() {
    return (
      <FormControl
        componentClass="input" type="text" value={this.state.value} onChange={this.handleChange.bind(this)}
        onBlur={this.onBlur.bind(this)} />
    );
  }
}
