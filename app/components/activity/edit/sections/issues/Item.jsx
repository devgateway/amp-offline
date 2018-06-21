/* eslint-disable jsx-a11y/anchor-has-content */
import React, { Component, PropTypes } from 'react';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as FMC from '../../../../../utils/constants/FeatureManagerConstants';
import AFField from './../../components/AFField';
import * as Types from '../../components/AFComponentTypes';
import FeatureManager from '../../../../../modules/util/FeatureManager';
import styles from './Item.css';

const logger = new Logger('AF Issues Item');

/**
 * @author Gabriel Inchauspe
 */
export default class Item extends Component {

  static contextTypes = {
    activity: PropTypes.object.isRequired
  };

  static propTypes = {
    issue: PropTypes.object,
    measure: PropTypes.object,
    actor: PropTypes.object,
    issueIndex: PropTypes.number,
    measureIndex: PropTypes.number,
    actorIndex: PropTypes.number,
    addMeasure: PropTypes.func.isRequired,
    addActor: PropTypes.func.isRequired,
    removeIssue: PropTypes.func.isRequired,
    removeMeasure: PropTypes.func.isRequired,
    removeActor: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  _generateIssueRow() {
    return (<div>
      <table className={styles.table}>
        <tr>
          <td>
            <span>{translate('Issue')}</span>
            <AFField
              parent={this.props.issue} fieldPath={`${AC.ISSUES}~${AC.ISSUE_NAME}`} type={Types.TEXT_AREA}
              showLabel={false} />
          </td>
          <td>
            <AFField
              parent={this.props.issue} fieldPath={`${AC.ISSUES}~${AC.ISSUE_DATE}`} type={Types.DATE}
              showLabel={false} />
          </td>
          <td>
            {FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_ISSUES_ADD_MEASURE) ?
              <span className={styles.addButton}>
                <a
                  title={translate('Add Measure')}
                  onClick={this.props.addMeasure.bind(null, this.props.issueIndex)}
                  href={null} />
              </span>
              : null}
            {FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_ISSUES_DELETE_ISSUE) ?
              <a
                title={translate('Delete Issue')}
                className={styles.delete}
                onClick={this.props.removeIssue.bind(null, this.props.issueIndex)} />
              : null}
          </td>
        </tr>
      </table>

      {(this.props.issue[AC.MEASURES])
        ? this.props.issue[AC.MEASURES].map((m, i) => (
          <Item
            measure={m} issue={this.props.issue} key={Math.random()} removeActor={this.props.removeActor}
            removeMeasure={this.props.removeMeasure} removeIssue={this.props.removeIssue}
            addMeasure={this.props.addMeasure} addActor={this.props.addActor} measureIndex={i}
            issueIndex={this.props.issueIndex} />
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
            <span>{translate('Measure')}</span>
            <AFField
              parent={this.props.measure} fieldPath={`${AC.ISSUES}~${AC.MEASURES}~${AC.MEASURE_NAME}`}
              type={Types.TEXT_AREA} showLabel={false} />
          </td>
          <td>
            <AFField
              parent={this.props.measure} fieldPath={`${AC.ISSUES}~${AC.MEASURES}~${AC.MEASURE_DATE}`}
              type={Types.DATE} showLabel={false} />
          </td>
          <td>
            {FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_ISSUES_ADD_ACTOR) ?
              <span className={styles.addButton}>
                <a
                  title={translate('Add Actor')}
                  onClick={this.props.addActor.bind(null, this.props.issueIndex).bind(null, this.props.measureIndex)}
                  href={null} />
              </span>
              : null}
            {FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_ISSUES_DELETE_MEASURE) ?
              <a
                title={translate('Delete Measure')}
                className={styles.delete}
                onClick={this.props.removeMeasure.bind(null, this.props.issueIndex)
                  .bind(null, this.props.measureIndex)} />
              : null}
          </td>
        </tr>
      </table>

      {(this.props.measure[AC.ACTORS])
        ? this.props.measure[AC.ACTORS].map((a, i) => (
          <Item
            actor={a} measure={this.props.measure} issue={this.props.issue} key={Math.random()}
            removeActor={this.props.removeActor}
            removeMeasure={this.props.removeMeasure} removeIssue={this.props.removeIssue}
            addMeasure={this.props.addMeasure} addActor={this.props.addActor}
            measureIndex={this.props.measureIndex} issueIndex={this.props.issueIndex} actorIndex={i} />
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
            <span>{translate('Actor')}</span>
            <AFField
              parent={this.props.actor} fieldPath={`${AC.ISSUES}~${AC.MEASURES}~${AC.ACTORS}~${AC.ACTOR_NAME}`}
              type={Types.TEXT_AREA} showLabel={false} />
          </td>
          <td>
            {FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_ISSUES_DELETE_ACTOR) ?
              <a
                title={translate('Delete Actor')}
                className={styles.delete}
                onClick={this.props.removeActor
                  .bind(null, this.props.issueIndex)
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
