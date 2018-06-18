import React, { Component, PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as FMC from '../../../../../utils/constants/FeatureManagerConstants';
import AFField from './../../components/AFField';
import * as Types from '../../components/AFComponentTypes';
import FeatureManager from '../../../../../modules/util/FeatureManager';

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
    actor: PropTypes.object
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  _generateIssueRow() {
    return (<div>
      <span>{translate('Issue')}</span>
      <AFField parent={this.props.issue} fieldPath={`${AC.ISSUES}~${AC.ISSUE_NAME}`} type={Types.TEXT_AREA} />
      <AFField parent={this.props.issue} fieldPath={`${AC.ISSUES}~${AC.ISSUE_DATE}`} type={Types.DATE} />
      {FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_ISSUES_ADD_MEASURE) ?
        <a href='#'>{translate('Add Measure')}</a> : null}
      {FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_ISSUES_DELETE_ISSUE) ?
        <a href='#'>{translate('Delete Issue')}</a> : null}

      {(this.props.issue[AC.MEASURES])
        ? <div>
          {this.props.issue[AC.MEASURES].map(m => (
            <Item measure={m} issue={this.props.issue} />
          ))}
        </div>
        : null}
    </div>);
  }

  _generateMeasureRow() {
    return (<div>
      <span>{translate('Measure')}</span>
      <AFField
        parent={this.props.measure} fieldPath={`${AC.ISSUES}~${AC.MEASURES}~${AC.MEASURE_NAME}`}
        type={Types.TEXT_AREA} />
      <AFField
        parent={this.props.measure} fieldPath={`${AC.ISSUES}~${AC.MEASURES}~${AC.MEASURE_DATE}`}
        type={Types.DATE} />
      {FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_ISSUES_ADD_ACTOR) ?
        <a href='#'>{translate('Add Actor')}</a> : null}
      {FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_ISSUES_DELETE_MEASURE) ?
        <a href='#'>{translate('Delete Measure')}</a> : null}

      {(this.props.measure[AC.ACTORS])
        ? <div>
          {this.props.measure[AC.ACTORS].map(a => (
            <Item actor={a} measure={this.props.measure} issue={this.props.issue} />
          ))}
        </div>
        : null}
    </div>);
  }

  _generateActorRow() {
    return (<div>
      <span>{translate('Actor')}</span>
      <AFField
        parent={this.props.actor} fieldPath={`${AC.ISSUES}~${AC.MEASURES}~${AC.ACTORS}~${AC.ACTOR_NAME}`}
        type={Types.TEXT_AREA} />
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
