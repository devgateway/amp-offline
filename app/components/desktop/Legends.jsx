/* eslint react/jsx-space-before-closing: 0 */
import React, { Component } from 'react';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import classNames from 'classnames';
import style from './Legends.css';
import translate from '../../utils/translate';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Legends');

export default class Legends extends Component {

  render() {
    logger.log('render');
    const legendSpan = classNames('glyphicon', 'glyphicon-info-sign', style.info_icon);
    const overlayPopover = (<Popover id="legendPopover">
      <div className={style.container}>
        <span className={style.red}>*</span><span className={style.red}>{translate('red')}</span>
        <span> - {translate('newDraftLegend')}</span>
        <hr />
        <span className={style.green}>*</span><span className={style.green}>{translate('green text')}</span>
        <span> - {translate('newUnvalidatedLegend')}</span>
        <hr />
        <span className={style.blue}>{translate('blue text')}</span>
        <span> - {translate('validatedActivitiesLegend')}</span>
        <hr />
        <span className={style.red}>{translate('red')}</span>
        <span> - {translate('existingDraftsLegend')}</span>
        <hr />
        <span className={style.green}>{translate('green text')}</span>
        <span> - {translate('existingUnvalidatedLegend')}</span>
        <hr />
        <span className={style.unsynced}>{translate('unsynced text')}</span>
        <span> - {translate('unsyncedLegend')}</span>
      </div>
    </Popover>);

    return (
      <OverlayTrigger trigger={['hover', 'focus']} rootClose placement="right" overlay={overlayPopover}>
        <div className={style.legend_container}>
          <span data-tip="legends" className={style.legend}>{translate('Legends')}</span>
          <span className={legendSpan} />
        </div>
      </OverlayTrigger>
    );
  }
}
