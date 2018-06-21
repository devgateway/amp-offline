import React, { Component, PropTypes } from 'react';
import { Button, Grid } from 'react-bootstrap';
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

  addMeasureHandler(issueIndex) {
    const measure = {
      [AC.MEASURE_NAME]: '',
      [AC.MEASURE_DATE]: null,
      [AC.ACTORS]: []
    };
    const issues = this.state.issues.slice();
    issues[issueIndex][AC.MEASURES].push(measure);
    this.setState({ issues });
    this.context.activity[AC.ISSUES] = issues;
  }

  addActorHandler(issueIndex, measureIndex) {
    const actor = {
      [AC.ACTOR_NAME]: ''
    };
    const issues = this.state.issues.slice();
    issues[issueIndex][AC.MEASURES][measureIndex][AC.ACTORS].push(actor);
    this.setState({ issues });
    this.context.activity[AC.ISSUES] = issues;
  }

  removeIssueHandler(issueIndex) {
    const issues = this.state.issues.slice();
    issues.splice(issueIndex, 1);
    this.setState({ issues });
    this.context.activity[AC.ISSUES] = issues;
  }

  removeMeasureHandler(issueIndex, measureIndex) {
    const issues = this.state.issues.slice();
    issues[issueIndex][AC.MEASURES].splice(measureIndex, 1);
    this.setState({ issues });
    this.context.activity[AC.ISSUES] = issues;
  }

  removeActorHandler(issueIndex, measureIndex, actorIndex) {
    const issues = this.state.issues.slice();
    issues[issueIndex][AC.MEASURES][measureIndex][AC.ACTORS].splice(actorIndex, 1);
    this.setState({ issues });
    this.context.activity[AC.ISSUES] = issues;
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
      this.state.issues.forEach((issue, i) => {
        content.push(<Item
          issue={issue} key={Math.random()} issueIndex={i} addActor={this.addActorHandler}
          addMeasure={this.addMeasureHandler} removeIssue={this.removeIssueHandler}
          removeMeasure={this.removeMeasureHandler} removeActor={this.removeActorHandler} />);
      });
    }
    return <div>{content}</div>;
  }
}

export default AFSection(AFIssues, ISSUES_SECTION);
