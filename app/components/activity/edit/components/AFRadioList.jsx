import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Radio } from 'react-bootstrap';
import { UIUtils } from 'amp-ui';
import Logger from '../../../../modules/util/LoggerManager';
import AFOption from './AFOption';
import * as styles from './AFRadioList.css';

const logger = new Logger('AFRadioList');

/**
 * List of radio boxes
 *
 * @author Nadejda Mandrescu
 */
export default class AFRadioList extends Component {
  static propTypes = {
    options: PropTypes.arrayOf(PropTypes.instanceOf(AFOption)).isRequired,
    value: PropTypes.object,
    onChange: PropTypes.func,
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.groupName = `radioListGroup-${UIUtils.stringToUniqueId('radioListGroup')}`;
  }

  render() {
    const { value, options, onChange } = this.props;
    const selectedId = value && value.id;
    const radioList = (options || []).map((o: AFOption) =>
      <Radio
        key={o.id} name={this.groupName} checked={selectedId === o.id} onChange={() => onChange(o)}
        className={styles.radio}>
        {o.displayFullValue}
      </Radio>
    );
    return (
      <FormGroup key={this.groupName} controlId={`controlId-${this.groupName}`}>
        {radioList}
      </FormGroup>
    );
  }
}
