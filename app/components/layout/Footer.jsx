/* eslint-disable no-undef */
import React, { Component } from 'react';
import os from 'os';
import translate from '../../utils/translate';
import styles from './Footer.css';
import {
  DG_COMPANY_NAME,
  DG_ADDRESS_1,
  DG_ADDRESS_2,
  DG_CONTACT_INFO,
  VERSION
} from '../../utils/Constants';
import DateUtils from '../../utils/DateUtils';

export default class Home extends Component {
  static getDevInfo() {
    let branchOrPr = null;
    let releaseDate = '';
    if (__BRANCH_NAME__ !== 'master') {
      releaseDate = DateUtils.createFormattedDateTime(__BUILD_DATE__);
      if (__PR_NR__) {
        branchOrPr = `PR #${__PR_NR__}`;
      } else {
        branchOrPr = `${__BRANCH_NAME__} ${__COMMIT_HASH__}`;
      }
    } else {
      releaseDate = DateUtils.createFormattedDate(__BUILD_DATE__);
    }

    const osAndArch = `${os.type()} ${os.arch()}`;
    return `${VERSION} ${branchOrPr} ${translate('build')} ${releaseDate} ${osAndArch}`;
  }

  render() {
    return (
      <div className={styles.footerContainer}>
        <footer className={[styles.footer, styles.footerText].join(' ')}>
          <p>
            {translate('amp-offline')} {this.constructor.getDevInfo()}
            {translate('amp-footer')}
          </p>
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
        </div>
      </div>
    );
  }
}
