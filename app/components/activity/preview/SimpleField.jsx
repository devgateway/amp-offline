import React, { Component, PropTypes } from 'react';
import styles from './ActivityPreview.css';

/**
 * Simple Field component that consists of a field title and field value
 * @author Nadejda Mandrescu
 */
export default class SimpleField extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    sameLine: PropTypes.bool
  };

  constructor(props) {
    super(props);
    console.log('constructor');
  }

  render() {
    const style = {
      display: this.props.sameLine === true ? 'inline' : 'block'
    };
    return (<div>
      <div className={styles.field_name} style={style}>{this.props.title}</div>
      <div className={styles.field_name}>{this.props.value}</div>
      <hr />
    </div>);
  }
}
