// @flow
import React, {Component} from 'react';
import style from './Navbar.css';
import translate from '../../utils/translate';

export default class Home extends Component {
  render() {
    return (
      <footer className={style.footer}>
        <p>{translate('Development Gateway')}</p>
      </footer>
    );
  }
}
