/* eslint react/jsx-space-before-closing: 0 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import style from './TopArea.css';
import translate from '../../utils/translate';
import Legends from './Legends';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Top area');

export default class TopArea extends Component {

  static propTypes = {
    currentWorkspaceSettings: PropTypes.object.isRequired,
    translationReducer: PropTypes.object.isRequired
  };

  render() {
    logger.log('render');
    const draftClasses = classNames(style.square_symbol, style.draft);
    const unvalidatedClasses = classNames(style.square_symbol, style.unvalidated);
    const validatedClasses = classNames(style.square_symbol, style.validated);
    const unsynced = classNames(style.letter_symbol, style.unsynced);
    const currencyP = classNames('navbar-text', 'pull-right', style.currency);
    const currencyLabel = classNames(style.currency_label);
    const ul = classNames('nav', 'navbar-nav', style.ul_var);
    const { currency } = this.props.currentWorkspaceSettings;
    const wsCurrencyCode = currency.code;
    const wsCurrencyLabel = currency['translated-value'][this.props.translationReducer.lang];
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
                  <span className={draftClasses} />{translate('Drafts')}
                </li>
                <li className={style.nav_label_li}>
                  <span className={unvalidatedClasses} />{translate('Unvalidated')}
                </li>
                <li className={style.nav_label_li}>
                  <span className={validatedClasses} />{translate('Validated')}
                </li>
                <li className={style.nav_label_li}>
                  <span className={unsynced}>ABC</span>{translate('Unsynced')}
                </li>
              </ul>

              <p className={currencyP}>{wsCurrencyCode}
                <span className={currencyLabel}> - {wsCurrencyLabel}</span>

              </p>
            </div>
          </nav>
        </div>
      </div>
    );
  }
}
