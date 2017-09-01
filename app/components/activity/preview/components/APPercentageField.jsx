import React, { Component, PropTypes } from 'react';
import styles from '../ActivityPreview.css';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Percentage Field component
 * @author Nadejda Mandrescu
 */
export default class APPercentageField extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.number,
    titleClass: PropTypes.string,
    valueClass: PropTypes.string
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    const percentage = this.props.value !== undefined && this.props.value !== null
      ? `${this.props.value}%` : null;
    return (<div>
      <span className={this.props.titleClass}>{this.props.title} </span>
      <span className={`${this.props.valueClass} ${styles.alignRight}`}>{percentage}</span>
    </div>);
  }
}
