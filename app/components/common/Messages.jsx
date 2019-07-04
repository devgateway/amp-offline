import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as Utils from '../../utils/Utils';
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
    const error = messages.map(m => <div key={Utils.stringToUniqueId()}>{m}</div>);
    return <div className={styles.rows} key={Utils.stringToUniqueId()}>{error}</div>;
  }

}
