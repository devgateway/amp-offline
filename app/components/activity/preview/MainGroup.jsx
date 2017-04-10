import React, { Component } from 'react';
import styles from './ActivityPreview.css';
import IdentificationSection from './IdentificationSection';
import InternalIdsSection from './InternalIdsSection';

/**
 * Main content
 * @author Nadejda Mandrescu
 */
export default class MainGroup extends Component {

  constructor(props) {
    super(props);
    console.log('constructor');
  }

  render() {
    return (<div className={styles.section_group}>
      <IdentificationSection />
      <InternalIdsSection />
    </div>);
  }
}
