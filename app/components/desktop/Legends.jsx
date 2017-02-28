// @flow
import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import style from './Legends.css';
import translate from '../../utils/translate';

export default class Legends extends Component {

  constructor() {
    super();
    console.log('constructor');
  }

  render() {
    console.log('render');
    return (<div className={style.legend_container}>
      <span data-tip="legends" className={style.legend}>{translate('Legends')}</span>
      <ReactTooltip place="top" type="light" effect="float" delayHide={250}>
        <div className={style.container}>
          <span className={style.red}>*</span><span className={style.red}>{translate('red')}</span>
          <span> - {translate('desktop.newDraftLegend')}</span>
          <hr/>
          <span className={style.green}>*</span><span className={style.green}>{translate('green text')}</span>
          <span> - {translate('desktop.newUnvalidatedLegend')}</span>
          <hr/>
          <span className={style.blue}>{translate('blue text')}</span>
          <span> - {translate('desktop.validatedActivitiesLegend')}</span>
          <hr/>
          <span className={style.red}>{translate('red')}</span>
          <span> - {translate('desktop.existingDraftsLegend')}</span>
          <hr/>
          <span className={style.green}>{translate('green text')}</span>
          <span> - {translate('desktop.existingUnvalidatedLegend')}</span>
        </div>
      </ReactTooltip>
    </div>);
  }
}
