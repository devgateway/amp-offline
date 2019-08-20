import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { UIUtils } from 'amp-ui';
import * as styles from './CommonStyles.css';

/**
 * @author Nadejda Mandrescu
 */
export default class Messages extends Component {
  static propTypes = {
    messages: PropTypes.arrayOf(PropTypes.string)
  };

  render() {
    const { messages } = this.props;
    if (!messages || !messages.length) {
      return null;
    }
    const error = messages.map(m => <div key={UIUtils.stringToUniqueId()}>{m}</div>);
    return <div className={styles.rows} key={UIUtils.stringToUniqueId()}>{error}</div>;
  }

}
