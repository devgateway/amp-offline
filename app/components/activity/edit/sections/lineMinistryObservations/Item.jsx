/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants, FeatureManagerConstants, FeatureManager } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import AFField from './../../components/AFField';
import * as Types from '../../components/AFComponentTypes';
import styles from './Item.css';

const logger = new Logger('AF Line Ministry Observations Item');

/**
 * @author Gabriel Inchauspe
 */
export default class Item extends Component {

  static contextTypes = {
    activity: PropTypes.object.isRequired
  };

  static propTypes = {
    observation: PropTypes.object,
    measure: PropTypes.object,
    actor: PropTypes.object,
    observationIndex: PropTypes.number,
    measureIndex: PropTypes.number,
    actorIndex: PropTypes.number,
    addMeasure: PropTypes.func.isRequired,
    addActor: PropTypes.func.isRequired,
    removeObservation: PropTypes.func.isRequired,
    removeMeasure: PropTypes.func.isRequired,
    removeActor: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
  }

  _generateLMORow() {
    return (<div>
      <table className={styles.table}>
        <tr>
          <td>
            <AFField
              parent={this.props.observation}
              fieldPath={`${ActivityConstants.LINE_MINISTRY_OBSERVATIONS}~${ActivityConstants.LINE_MINISTRY_OBSERVATIONS_NAME}`}
              type={Types.TEXT_AREA} customLabel={translate('Observation')} />
          </td>
          <td>
            <AFField
              parent={this.props.observation}
              fieldPath={`${ActivityConstants.LINE_MINISTRY_OBSERVATIONS}~${ActivityConstants.LINE_MINISTRY_OBSERVATIONS_DATE}`}
              type={Types.DATE}
              showLabel={false} extraParams={{ todayAsDefaultDate: true }} />
          </td>
          <td>
            {FeatureManager.isFMSettingEnabled(FeatureManagerConstants.ACTIVITY_LINE_MINISTRY_OBSERVATIONS_ADD_MEASURE) ?
              <span className={styles.addButton}>
                <span>{translate('Add Measure')}:</span>
                <a
                  title={translate('Add Measure')}
                  onClick={this.props.addMeasure.bind(null, this.props.observationIndex)}
                  href={null} />
              </span>
              : null}
            {FeatureManager.isFMSettingEnabled(FeatureManagerConstants.ACTIVITY_LINE_MINISTRY_OBSERVATIONS_DELETE_OBSERVATION) ?
              <a
                title={translate('Delete Line Ministry Observation')}
                className={styles.delete}
                onClick={this.props.removeObservation.bind(null, this.props.observationIndex)} />
              : null}
          </td>
        </tr>
      </table>

      {(this.props.observation[ActivityConstants.MEASURES])
        ? this.props.observation[ActivityConstants.MEASURES].map((m, i) => (
          <Item
            measure={m} observation={this.props.observation} key={Math.random()} removeActor={this.props.removeActor}
            removeMeasure={this.props.removeMeasure} removeObservation={this.props.removeObservation}
            addMeasure={this.props.addMeasure} addActor={this.props.addActor} measureIndex={i}
            observationIndex={this.props.observationIndex} />
        ))
        : null}
    </div>);
  }

  _generateMeasureRow() {
    return (<div className={styles.measure}>
      <table className={styles.table}>
        <tr>
          <td>
            <img role={'presentation'} className={styles.tree} />
            <AFField
              parent={this.props.measure}
              fieldPath={`${ActivityConstants.LINE_MINISTRY_OBSERVATIONS}~${ActivityConstants.MEASURES}~${ActivityConstants.MEASURE_NAME}`}
              type={Types.TEXT_AREA} customLabel={translate('Measure')} />
          </td>
          <td>
            <AFField
              parent={this.props.measure}
              fieldPath={`${ActivityConstants.LINE_MINISTRY_OBSERVATIONS}~${ActivityConstants.MEASURES}~${ActivityConstants.MEASURE_DATE}`}
              type={Types.DATE} showLabel={false} extraParams={{ todayAsDefaultDate: true }} />
          </td>
          <td>
            {FeatureManager.isFMSettingEnabled(FeatureManagerConstants.ACTIVITY_LINE_MINISTRY_OBSERVATIONS_ADD_ACTOR) ?
              <span className={styles.addButton}>
                <span>{translate('Add Actor')}:</span>
                <a
                  title={translate('Add Actor')}
                  onClick={this.props.addActor.bind(null, this.props.observationIndex).bind(null, this.props.measureIndex)}
                  href={null} />
              </span>
              : null}
            {FeatureManager.isFMSettingEnabled(FeatureManagerConstants.ACTIVITY_LINE_MINISTRY_OBSERVATIONS_DELETE_MEASURE) ?
              <a
                title={translate('Delete Measure')}
                className={styles.delete}
                onClick={this.props.removeMeasure.bind(null, this.props.observationIndex)
                  .bind(null, this.props.measureIndex)} />
              : null}
          </td>
        </tr>
      </table>

      {(this.props.measure[ActivityConstants.ACTORS])
        ? this.props.measure[ActivityConstants.ACTORS].map((a, i) => (
          <Item
            actor={a} measure={this.props.measure} observation={this.props.observation} key={Math.random()}
            removeActor={this.props.removeActor}
            removeMeasure={this.props.removeMeasure} removeObservation={this.props.removeObservation}
            addMeasure={this.props.addMeasure} addActor={this.props.addActor}
            measureIndex={this.props.measureIndex} observationIndex={this.props.observationIndex} actorIndex={i} />
        ))
        : null}
    </div>);
  }

  _generateActorRow() {
    return (<div className={styles.actor}>
      <table className={styles.table}>
        <tr>
          <td>
            <img role={'presentation'} className={[styles.tree, styles.actor].join(' ')} />
            <AFField
              parent={this.props.actor}
              fieldPath={`${ActivityConstants.LINE_MINISTRY_OBSERVATIONS}~${ActivityConstants.MEASURES}~${ActivityConstants.ACTORS}~${ActivityConstants.ACTOR_NAME}`}
              type={Types.TEXT_AREA} customLabel={translate('Actor')} />
          </td>
          <td>
            {FeatureManager.isFMSettingEnabled(FeatureManagerConstants.ACTIVITY_LINE_MINISTRY_OBSERVATIONS_DELETE_ACTOR) ?
              <a
                title={translate('Delete Actor')}
                className={[styles.delete, styles.delete_actor].join(' ')}
                onClick={this.props.removeActor
                  .bind(null, this.props.observationIndex)
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
      return this._generateLMORow();
    }
  }
}
