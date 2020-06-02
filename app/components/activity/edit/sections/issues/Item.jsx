/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants, FeatureManager, FeatureManagerConstants } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import AFField from './../../components/AFField';
import * as Types from '../../components/AFComponentTypes';
import styles from './Item.css';

const logger = new Logger('AF Issues/Line Ministry Observation Item');

/**
 * @author Gabriel Inchauspe
 */
export default class Item extends Component {

  static contextTypes = {
    activity: PropTypes.object.isRequired
  };

  static propTypes = {
    item: PropTypes.object,
    measure: PropTypes.object,
    actor: PropTypes.object,
    itemIndex: PropTypes.number,
    measureIndex: PropTypes.number,
    actorIndex: PropTypes.number,
    addMeasure: PropTypes.func.isRequired,
    addActor: PropTypes.func.isRequired,
    removeTopItem: PropTypes.func.isRequired,
    removeMeasure: PropTypes.func.isRequired,
    removeActor: PropTypes.func.isRequired,
    topPath: PropTypes.string.isRequired,
    topFMPath: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
  }

  _generateIssueRow() {
    const { topPath, topFMPath } = this.props;
    return (<div>
      <table className={styles.table}>
        <tr>
          <td>
            <AFField
              parent={this.props.item} fieldPath={`${topPath}~${ActivityConstants.ISSUE_NAME}`}
              type={Types.TEXT_AREA} />
          </td>
          <td>
            <AFField
              parent={this.props.item} fieldPath={`${topPath}~${ActivityConstants.ISSUE_DATE}`}
              type={Types.DATE}
              showLabel={false} extraParams={{ todayAsDefaultDate: true }} />
          </td>
          <td>
            {FeatureManager.isFMSettingEnabled(FeatureManagerConstants[`${topFMPath}_ADD_MEASURE`]) ?
              <span className={styles.addButton}>
                <span>{translate('Add Measure')}:</span>
                <a
                  title={translate('Add Measure')}
                  onClick={this.props.addMeasure.bind(null, this.props.itemIndex)}
                  href={null} />
              </span>
              : null}
            {FeatureManager.isFMSettingEnabled(FeatureManagerConstants[`${topFMPath}_DELETE_TOP`]) ?
              <a
                title={translate('Delete')}
                className={styles.delete}
                onClick={this.props.removeTopItem.bind(null, this.props.itemIndex)} />
              : null}
          </td>
        </tr>
      </table>

      {(this.props.item[ActivityConstants.MEASURES])
        ? this.props.item[ActivityConstants.MEASURES].map((m, i) => (
          <Item
            measure={m} item={this.props.item} key={Math.random()} removeActor={this.props.removeActor}
            removeMeasure={this.props.removeMeasure} removeTopItem={this.props.removeTopItem}
            addMeasure={this.props.addMeasure} addActor={this.props.addActor} measureIndex={i}
            itemIndex={this.props.itemIndex} topPath={this.props.topPath} topFMPath={this.props.topFMPath} />
        ))
        : null}
    </div>);
  }

  _generateMeasureRow() {
    const { topPath, topFMPath } = this.props;
    return (<div className={styles.measure}>
      <table className={styles.table}>
        <tr>
          <td>
            <img role={'presentation'} className={styles.tree} />
            <AFField
              parent={this.props.measure}
              fieldPath={`${topPath}~${ActivityConstants.MEASURES}~${ActivityConstants.MEASURE_NAME}`}
              type={Types.TEXT_AREA} />
          </td>
          <td>
            <AFField
              parent={this.props.measure}
              fieldPath={`${topPath}~${ActivityConstants.MEASURES}~${ActivityConstants.MEASURE_DATE}`}
              type={Types.DATE} showLabel={false} extraParams={{ todayAsDefaultDate: true }} />
          </td>
          <td>
            {FeatureManager.isFMSettingEnabled(FeatureManagerConstants[`${topFMPath}_ADD_ACTOR`]) ?
              <span className={styles.addButton}>
                <span>{translate('Add Actor')}:</span>
                <a
                  title={translate('Add Actor')}
                  onClick={this.props.addActor.bind(null, this.props.itemIndex).bind(null, this.props.measureIndex)}
                  href={null} />
              </span>
              : null}
            {FeatureManager.isFMSettingEnabled(FeatureManagerConstants[`${topFMPath}_DELETE_MEASURE`]) ?
              <a
                title={translate('Delete Measure')}
                className={styles.delete}
                onClick={this.props.removeMeasure.bind(null, this.props.itemIndex)
                  .bind(null, this.props.measureIndex)} />
              : null}
          </td>
        </tr>
      </table>

      {(this.props.measure[ActivityConstants.ACTORS])
        ? this.props.measure[ActivityConstants.ACTORS].map((a, i) => (
          <Item
            actor={a} measure={this.props.measure} item={this.props.item} key={Math.random()}
            removeActor={this.props.removeActor}
            removeMeasure={this.props.removeMeasure} removeTopItem={this.props.removeTopItem}
            addMeasure={this.props.addMeasure} addActor={this.props.addActor}
            measureIndex={this.props.measureIndex} itemIndex={this.props.itemIndex} actorIndex={i}
            topPath={this.props.topPath} topFMPath={this.props.topFMPath} />
        ))
        : null}
    </div>);
  }

  _generateActorRow() {
    const { topPath, topFMPath } = this.props;
    return (<div className={styles.actor}>
      <table className={styles.table}>
        <tr>
          <td>
            <img role={'presentation'} className={[styles.tree, styles.actor].join(' ')} />
            <AFField
              parent={this.props.actor}
              fieldPath={`${topPath}~${ActivityConstants.MEASURES}~${ActivityConstants.ACTORS}~${ActivityConstants.ACTOR_NAME}`}
              type={Types.TEXT_AREA} />
          </td>
          <td>
            {FeatureManager.isFMSettingEnabled(FeatureManagerConstants[`${topFMPath}_DELETE_ACTOR`]) ?
              <a
                title={translate('Delete Actor')}
                className={[styles.delete, styles.delete_actor].join(' ')}
                onClick={this.props.removeActor
                  .bind(null, this.props.itemIndex)
                  .bind(null, this.props.measureIndex)
                  .bind(null, this.props.actorIndex)} />
              : null}
          </td>
        </tr>
      </table>
    </div>);
  }

  render() {
    if (this.props.actor) {
      return this._generateActorRow();
    } else if (this.props.measure) {
      return this._generateMeasureRow();
    } else {
      return this._generateIssueRow();
    }
  }
}
