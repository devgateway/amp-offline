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

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.state = {
      issues: this.props.activity[AC.ISSUES] || []
    };

    this.addMeasureHandler = this.addMeasureHandler.bind(this);
    this.addActorHandler = this.addActorHandler.bind(this);
    this.removeIssueHandler = this.removeIssueHandler.bind(this);
    this.removeMeasureHandler = this.removeMeasureHandler.bind(this);
    this.removeActorHandler = this.removeActorHandler.bind(this);
  }

  addIssueHandler() {
    const newIssuesList = this.state.issues.slice();
    const newIssue = {
      [AC.ISSUE_DATE]: null,
      [AC.MEASURES]: [],
      [AC.ISSUE_NAME]: ''
    };
    newIssuesList.push(newIssue);
    this.setState({ issues: newIssuesList });
    if (!this.context.activity[AC.ISSUES]) {
      this.context.activity[AC.ISSUES] = [];
    }
    this.context.activity[AC.ISSUES].push(newIssue);
  }

  addMeasureHandler(a, b) {
    debugger;
  }

  addActorHandler(a, b) {
    debugger;
  }

  removeIssueHandler(a, b) {
    debugger;
  }

  removeMeasureHandler(a, b) {
    debugger;
  }

  removeActorHandler(a, b) {
    debugger;
  }

  render() {
    const content = [];
    if (FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_ISSUES_ADD_ISSUE)) {
      content.push(<Button
        bsStyle="primary"
        key={Math.random()}
        onClick={this.addIssueHandler.bind(this)}>{translate('Add Issue')}
      </Button>);
    }
    if (this.state.issues) {
      this.state.issues.forEach(i => {
        content.push(<Item
          issue={i} key={Math.random()} addActor={this.addActorHandler}
          addMeasure={this.addMeasureHandler} removeIssue={this.removeIssueHandler}
          removeMeasure={this.removeMeasureHandler} removeActor={this.removeActorHandler} />);
      });
    }
    return <div>{content}</div>;
  }
}

export default AFSection(AFIssues, ISSUES_SECTION);
