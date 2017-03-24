/* eslint react/jsx-space-before-closing: 0 */
import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import style from './Legends.css';
import translate from '../../utils/translate';

export default class Legends extends Component {

  render() {
    console.log('render');
    return (<div className={style.legend_container}>
      <span data-tip="legends" className={style.legend}>{translate('Legends')}</span>
      <ReactTooltip
        place="right" type="light" effect="solid" delayHide={250} multiline border offset={{ bottom: 40, right: 75 }}
      >
        <div className={style.container}>
          <span className={style.red}>*</span><span className={style.red}>{translate('red')}</span>
          <span> - {translate('newDraftLegend')}</span>
          <hr/>
          <span className={style.green}>*</span><span className={style.green}>{translate('green text')}</span>
          <span> - {translate('newUnvalidatedLegend')}</span>
          <hr/>
          <span className={style.blue}>{translate('blue text')}</span>
          <span> - {translate('validatedActivitiesLegend')}</span>
          <hr/>
          <span className={style.red}>{translate('red')}</span>
          <span> - {translate('existingDraftsLegend')}</span>
          <hr/>
          <span className={style.green}>{translate('green text')}</span>
          <span> - {translate('existingUnvalidatedLegend')}</span>
        </div>
      </ReactTooltip>
    </div>);
  }
}
