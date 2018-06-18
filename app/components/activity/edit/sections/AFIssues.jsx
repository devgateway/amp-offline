import React, { Component, PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import AFSection from './AFSection';
import { ISSUES_SECTION } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import * as FMC from '../../../../utils/constants/FeatureManagerConstants';
import Logger from '../../../../modules/util/LoggerManager';
import FeatureManager from '../../../../modules/util/FeatureManager';
import translate from '../../../../utils/translate';
import Item from './issues/Item';

const logger = new Logger('AF Issues');

/**
 * Issues Section
 * @author Gabriel Inchauspe
 */
class AFIssues extends Component {

  static contextTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  addIssueHandler() {

  }

  render() {
    const content = [];
    if (FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_ISSUES_ADD_ISSUE)) {
      content.push(<Button
        bsStyle="primary"
        onClick={this.addIssueHandler.bind(this)}>{translate('Add Issue')}
      </Button>);
    }
    if (this.context.activity[AC.ISSUES]) {
      this.context.activity[AC.ISSUES].forEach(i => {
        content.push(<Item issue={i} />);
      });
    }
    return <div>{content}</div>;
  }
}

export default AFSection(AFIssues, ISSUES_SECTION);
