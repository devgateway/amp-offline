import React, { Component, PropTypes } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
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
    return (<table>
      <tr>
        <td>
          <span>{translate('Issue')}</span>
          <AFField
            parent={this.props.issue} fieldPath={`${AC.ISSUES}~${AC.ISSUE_NAME}`} type={Types.TEXT_AREA}
            showLabel={false} />
        </td>
        <td>
          <AFField
            parent={this.props.issue} fieldPath={`${AC.ISSUES}~${AC.ISSUE_DATE}`} type={Types.DATE} showLabel={false} />
        </td>
        <td>
          {FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_ISSUES_ADD_MEASURE) ?
            <a onClick={this.props.addMeasure.bind(null, this.props.issueIndex)}>
              {translate('Add Measure')}
            </a> : null}
          {FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_ISSUES_DELETE_ISSUE) ?
            <a href='#' onClick={this.props.removeIssue}>{translate('Delete Issue')}</a> : null}
        </td>
      </tr>

      {(this.props.issue[AC.MEASURES])
        ? this.props.issue[AC.MEASURES].map(m => (
          (<tr>
            <td>
              <Item
                measure={m} issue={this.props.issue} key={Math.random()} removeActor={this.props.removeActor}
                removeMeasure={this.props.removeMeasure} removeIssue={this.props.removeIssue}
                addMeasure={this.props.addMeasure} addActor={this.props.addActor} />
            </td>
          </tr>)
        ))
        : null}
    </table>);
  }

  _generateMeasureRow() {
    return (<table>
      <tr>
        <td><img className={styles.tree} href={null} /></td>
        <td>
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
            <a href='#' onClick={this.props.addActor}>{translate('Add Actor')}</a> : null}
          {FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_ISSUES_DELETE_MEASURE) ?
            <a href='#' onClick={this.props.removeMeasure.bind(null, this.props.measure)}>
              {translate('Delete Measure')}
            </a> : null}
        </td>
      </tr>

      {(this.props.measure[AC.ACTORS])
        ? this.props.measure[AC.ACTORS].map(a => (
          (<tr>
            <td><img className={[styles.tree, styles.actor].join(' ')} href={null} /></td>
            <td>
              <Item
                actor={a} measure={this.props.measure} issue={this.props.issue} key={Math.random()}
                removeActor={this.props.removeActor}
                removeMeasure={this.props.removeMeasure} removeIssue={this.props.removeIssue}
                addMeasure={this.props.addMeasure} addActor={this.props.addActor} />
            </td>
          </tr>)
        ))
        : null}
    </table>);
  }

  _generateActorRow() {
    return (<table>
      <tr>
        <td>
          <span>{translate('Actor')}</span>
          <AFField
            parent={this.props.actor} fieldPath={`${AC.ISSUES}~${AC.MEASURES}~${AC.ACTORS}~${AC.ACTOR_NAME}`}
            type={Types.TEXT_AREA} showLabel={false} />
        </td>
        <td>
          {FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_ISSUES_DELETE_ACTOR) ?
            <a href='#' onClick={this.props.removeActor}>{translate('Delete Actor')}</a> : null}
        </td>
      </tr>
    </table>);
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
