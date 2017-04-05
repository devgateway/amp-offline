/* eslint react/jsx-space-before-closing: 0 */
import React, { Component } from 'react';
import classNames from 'classnames';
import style from './TopArea.css';
import translate from '../../utils/translate';
import Legends from './Legends';
import LoggerManager from '../../modules/util/LoggerManager';

export default class TopArea extends Component {

  render() {
    LoggerManager.log('render');
    const draftClasses = classNames(style.square_symbol, style.draft);
    const unvalidatedClasses = classNames(style.square_symbol, style.unvalidated);
    const validatedClasses = classNames(style.square_symbol, style.validated);
    const unsynced = classNames(style.letter_symbol, style.unsynced);
    const currencyP = classNames('navbar-text', 'pull-right', style.currency);
    const currencyLabel = classNames(style.currency_label);
    // const legendSpan = classNames('glyphicon', 'glyphicon-info-sign', style.info_icon);
    const ul = classNames('nav', 'navbar-nav', style.ul_var);

    return (
      <div className="navbar-wrapper">
        <div className="container">
          <nav className="navbar navbar-default legend_nav">
            <div className="container">
              <ul className={ul}>
                <li className={style.nav_label}>
                  <Legends />
                </li>
                <li className={style.nav_label_li}>
                  <span className={style.letter_symbol}>*</span>{translate('New')}
                </li>
                <li className={style.nav_label_li}>
                  <span className={draftClasses}/>{translate('Drafts')}
                </li>
                <li className={style.nav_label_li}>
                  <span className={unvalidatedClasses}/>{translate('Unvalidated')}
                </li>
                <li className={style.nav_label_li}>
                  <span className={validatedClasses}/>{translate('Validated')}
                </li>
                <li className={style.nav_label_li}>
                  <span className={unsynced}>ABC</span>{translate('Unsynced')}
                </li>
              </ul>

              <p className={currencyP}>USD
                <span className={currencyLabel}> - US Dollar</span>
              </p>
            </div>
          </nav>
        </div>
      </div>
    );
  }
}
