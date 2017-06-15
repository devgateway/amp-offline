/* eslint-disable no-undef */
import React, { Component } from 'react';
import translate from '../../utils/translate';
import styles from './Footer.css';
import {
  DG_COMPANY_NAME,
  DG_ADDRESS_1,
  DG_ADDRESS_2,
  DG_CONTACT_INFO,
  VERSION
} from '../../utils/Constants';

export default class Home extends Component {
  render() {
    return (
      <div className={styles.footerContainer}>
        <footer className={[styles.footer, styles.footerText].join(' ')}>
          <p>{translate('amp-offline')} {VERSION} {translate('amp-footer')}</p>
        </footer>
        <div className={[styles.footerText, styles.footerImageContainer].join(' ')}>
          <img className={styles.footerImage} alt={'footer'} />
          <br />
          {DG_COMPANY_NAME}
          <br />
          {DG_ADDRESS_1}
          <br />
          {DG_ADDRESS_2}
          <br />
          {DG_CONTACT_INFO}
          <br />
          {__COMMIT_HASH__}
        </div>
      </div>
    );
  }
}
