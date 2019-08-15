import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Radio } from 'react-bootstrap';
import { UIUtils } from 'amp-ui';
import Logger from '../../../../modules/util/LoggerManager';
import translate from '../../../../utils/translate';

const logger = new Logger('AFRadioBoolean');

/**
 * Component to display a boolean field with radio boxes
 *
 * @author Nadejda Mandrescu
 */
export default class AFRadioBoolean extends Component {
  static propTypes = {
    value: PropTypes.bool,
    onChange: PropTypes.func,
    trueName: PropTypes.string,
    falseName: PropTypes.string,
  };

  static defaultProps = {
    trueName: 'Yes',
    falseName: 'No',
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.groupName = `yesNoGroup-${UIUtils.stringToUniqueId('yesNoGroup')}`;
  }

  render() {
    const { trueName, falseName, value, onChange } = this.props;
    return (
      <FormGroup key={this.groupName} controlId={`controlId-${this.groupName}`}>
        <Radio key="yes" name={this.groupName} inline checked={value === true} onChange={() => onChange(true)}>
          {translate(trueName)}
        </Radio>
        <Radio key="no" name={this.groupName} inline checked={value === false} onChange={() => onChange(false)}>
          {translate(falseName)}
        </Radio>
      </FormGroup>
    );
  }
}
