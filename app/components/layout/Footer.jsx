import React, { Component } from 'react';
import translate from '../../utils/translate';
import styles from './Footer.css';

export default class Home extends Component {
  render() {
    return (
      <div className={styles.footerContainer}>
        <footer className={[styles.footer, styles.footerText].join(' ')}>
          <p>AMP {VERSION}  {translate('amp-footer')}</p>
        </footer>
        <div className={[styles.footerText, styles.footerImage].join(' ')}>
          <img src="./assets/images/dgf_logo_bottom.gif" />
          <br/>
          Development Gateway
          <br/>
          1110 Vermont Ave, NW, Suite 500
          <br/>
          Washington, DC 20005 USA
          <br/>
          info@developmentgateway.org, Tel: +1.202.572.9200, Fax: +1 202.572.9290
        </div>
      </div>
    );
  }
}
