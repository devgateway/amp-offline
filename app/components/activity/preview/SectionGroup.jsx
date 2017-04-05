import React, { Component, PropTypes } from 'react';
import SimpleField from './SimpleField';
import styles from './ActivityPreview.css';
import translate from '../../../utils/translate';
import LoggerManager from '../../../modules/util/LoggerManager';

/**
 * Section Group for a set of components
 */
export default class SectionGroup extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(SimpleField).isRequired
  };

  static instance(trnLabel, children) {
    return <SectionGroup key={trnLabel} title={translate(trnLabel)}>{children}</SectionGroup>;
  }
  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return (<div className={styles.section_group}>
      <div className={styles.section_title}>{this.props.title}</div>
      {this.props.children}
    </div>);
  }
}
