import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { ActivityConstants, FeatureManagerConstants, FeatureManager } from 'amp-ui';
import AFSection from './AFSection';
import { ISSUES_SECTION } from './AFSectionConstants';
import Logger from '../../../../modules/util/LoggerManager';
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
    logger.debug('constructor');
    this.state = {
      issues: this.props.activity[ActivityConstants.ISSUES] || []
    };

    this.addMeasureHandler = this.addMeasureHandler.bind(this);
    this.addActorHandler = this.addActorHandler.bind(this);
    this.removeTopItemHandler = this.removeTopItemHandler.bind(this);
    this.removeMeasureHandler = this.removeMeasureHandler.bind(this);
    this.removeActorHandler = this.removeActorHandler.bind(this);
  }

  addIssueHandler() {
    const newIssuesList = this.state.issues.slice();
    const newIssue = {
      [ActivityConstants.ISSUE_DATE]: undefined,
      [ActivityConstants.MEASURES]: [],
      [ActivityConstants.ISSUE_NAME]: ''
    };
    newIssuesList.push(newIssue);
    this.setState({ issues: newIssuesList });
    if (!this.context.activity[ActivityConstants.ISSUES]) {
      this.context.activity[ActivityConstants.ISSUES] = [];
    }
    this.context.activity[ActivityConstants.ISSUES].push(newIssue);
  }

  addMeasureHandler(itemIndex) {
    const measure = {
      [ActivityConstants.MEASURE_NAME]: '',
      [ActivityConstants.MEASURE_DATE]: undefined,
      [ActivityConstants.ACTORS]: []
    };
    const issues = this.state.issues.slice();
    issues[itemIndex][ActivityConstants.MEASURES].push(measure);
    this.setState({ issues });
    this.context.activity[ActivityConstants.ISSUES] = issues;
  }

  addActorHandler(itemIndex, measureIndex) {
    const actor = {
      [ActivityConstants.ACTOR_NAME]: ''
    };
    const issues = this.state.issues.slice();
    issues[itemIndex][ActivityConstants.MEASURES][measureIndex][ActivityConstants.ACTORS].push(actor);
    this.setState({ issues });
    this.context.activity[ActivityConstants.ISSUES] = issues;
  }

  removeTopItemHandler(itemIndex) {
    const issues = this.state.issues.slice();
    issues.splice(itemIndex, 1);
    this.setState({ issues });
    this.context.activity[ActivityConstants.ISSUES] = issues;
  }

  removeMeasureHandler(itemIndex, measureIndex) {
    const issues = this.state.issues.slice();
    issues[itemIndex][ActivityConstants.MEASURES].splice(measureIndex, 1);
    this.setState({ issues });
    this.context.activity[ActivityConstants.ISSUES] = issues;
  }

  removeActorHandler(itemIndex, measureIndex, actorIndex) {
    const issues = this.state.issues.slice();
    issues[itemIndex][ActivityConstants.MEASURES][measureIndex][ActivityConstants.ACTORS].splice(actorIndex, 1);
    this.setState({ issues });
    this.context.activity[ActivityConstants.ISSUES] = issues;
  }

  render() {
    const content = [];
    if (FeatureManager.isFMSettingEnabled(FeatureManagerConstants.ACTIVITY_ISSUES_ADD_TOP)) {
      content.push(<Button
        bsStyle="primary"
        key={Math.random()}
        onClick={this.addIssueHandler.bind(this)}>{translate('Add Issue')}
      </Button>);
    }
    if (this.state.issues) {
      this.state.issues.forEach((issue, i) => {
        content.push(<Item
          item={issue} key={Math.random()} itemIndex={i} addActor={this.addActorHandler}
          addMeasure={this.addMeasureHandler} removeTopItem={this.removeTopItemHandler}
          removeMeasure={this.removeMeasureHandler} removeActor={this.removeActorHandler}
          topPath={ActivityConstants.ISSUES} topFMPath="ACTIVITY_ISSUES"
          prefix="ISSUE"
        />);
      });
    }
    return <div>{content}</div>;
  }
}

export default AFSection(AFIssues, ISSUES_SECTION);
