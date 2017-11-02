import React, { Component } from 'react';
import os from 'os';
import translate from '../../utils/translate';
import styles from './Footer.css';
import {
  DG_ADDRESS_1,
  DG_ADDRESS_2,
  DG_COMPANY_NAME,
  DG_CONTACT_INFO,
  VERSION
} from '../../utils/Constants';
import DateUtils from '../../utils/DateUtils';
import * as Utils from '../../utils/Utils';

export default class Home extends Component {
  static getDevInfo() {
    let branchOrPr = '';
    let releaseDate = '';
    if (!Utils.isReleaseBranch()) {
      const prNr = Utils.getPR();
      releaseDate = DateUtils.createFormattedDateTime(Utils.getBuildDate());
      if (prNr) {
        branchOrPr = ` PR #${prNr}`;
      } else {
        branchOrPr = ` ${Utils.getBranch()} ${Utils.getCommitHash()}`;
      }
    } else {
      releaseDate = DateUtils.createFormattedDate(Utils.getBuildDate());
    }

    const osAndArch = `${os.type()} ${os.arch()}`;
    return `${VERSION}${branchOrPr} ${translate('build')} ${releaseDate} ${osAndArch}`;
  }

  render() {
    return (
      <div className={styles.footerContainer}>
        <footer className={[styles.footer, styles.footerText].join(' ')}>
          <p>
            {translate('amp-offline')} {this.constructor.getDevInfo()} {translate('amp-footer')}
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
