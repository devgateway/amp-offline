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
import DateUtils from '../../utils/DateUtils';

export default class Home extends Component {
  getDevInfo() {
    const branch = __BRANCH_NAME__ !== 'master' ?
      `${__BRANCH_NAME__} ${__COMMIT_HASH__}` :
      '';

    const releaseDate = DateUtils.createFormattedDateTime(__BUILD_DATE__);
    const osAndArch = `${__OS_TYPE__} ${__ARCH__}`;
    return `AMP Offline ${VERSION} ${branch} build ${releaseDate} ${osAndArch} 
    Developed in partnership with OECD, UNDP, WB, Government of Ethiopia and DGF`;
  }

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
          <br/>
          {this.getDevInfo()}
        </div>
      </div>
    );
  }
}
