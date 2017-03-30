import React, { Component, PropTypes } from 'react';
import SimpleField from './SimpleField';
import styles from './ActivityPreview.css';

/**
 * Section Group for a set of components
 */
export default class SectionGroup extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    simpleFields: PropTypes.arrayOf(SimpleField)
  };

  constructor(props) {
    super(props);
    console.log('constructor');
  }

  render() {
    return (<div className={styles.section_group}>
      <div className={styles.section_title}>{this.props.title}</div>
      {this.props.simpleFields}
    </div>);
  }
}
