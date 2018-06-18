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

  render() {
    if (this.props.actor) {

    } else if (this.props.measure) {

    } else {
      return (<div>
        <span>{translate('Issue')}</span>
        <AFField parent={this.props.issue} fieldPath={`${AC.ISSUE_NAME}`} type={Types.TEXT_AREA} />
        <AFField parent={this.props.issue} fieldPath={`${AC.ISSUE_DATE}`} />
        {FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_ISSUES_ADD_MEASURE) ?
          <Button bsStyle="primary">{translate('Add Measure')} </Button>
          : null}
      </div>);
    }
    return null;
  }
}
