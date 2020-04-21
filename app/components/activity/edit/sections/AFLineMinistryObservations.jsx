import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { ActivityConstants, FeatureManagerConstants, FeatureManager } from 'amp-ui';
import AFSection from './AFSection';
import { LINE_MINISTRY_OBSERVATIONS } from './AFSectionConstants';
import Logger from '../../../../modules/util/LoggerManager';
import translate from '../../../../utils/translate';
import Item from './lineMinistryObservations/Item';

const logger = new Logger('AF Line Ministry Observations');

/**
 * Line Ministry Observations Section
 * @author Gabriel Inchauspe
 */
class AFLineMinistryObservations extends Component {

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
      lineMinistryObservations: this.props.activity[ActivityConstants.LINE_MINISTRY_OBSERVATIONS] || []
    };

    this.addMeasureHandler = this.addMeasureHandler.bind(this);
    this.addActorHandler = this.addActorHandler.bind(this);
    this.removeObservationHandler = this.removeObservationHandler.bind(this);
    this.removeMeasureHandler = this.removeMeasureHandler.bind(this);
    this.removeActorHandler = this.removeActorHandler.bind(this);
  }

  addObservationHandler() {
    const newObservationsList = this.state.lineMinistryObservations.slice();
    const newObservation = {
      [ActivityConstants.LINE_MINISTRY_OBSERVATIONS_DATE]: undefined,
      [ActivityConstants.MEASURES]: [],
      [ActivityConstants.LINE_MINISTRY_OBSERVATIONS_NAME]: ''
    };
    newObservationsList.push(newObservation);
    this.setState({ lineMinistryObservations: newObservationsList });
    if (!this.context.activity[ActivityConstants.LINE_MINISTRY_OBSERVATIONS]) {
      this.context.activity[ActivityConstants.LINE_MINISTRY_OBSERVATIONS] = [];
    }
    this.context.activity[ActivityConstants.LINE_MINISTRY_OBSERVATIONS].push(newObservation);
  }

  addMeasureHandler(observationIndex) {
    const measure = {
      [ActivityConstants.MEASURE_NAME]: '',
      [ActivityConstants.MEASURE_DATE]: undefined,
      [ActivityConstants.ACTORS]: []
    };
    const lineMinistryObservations = this.state.lineMinistryObservations.slice();
    lineMinistryObservations[observationIndex][ActivityConstants.MEASURES].push(measure);
    this.setState({ lineMinistryObservations });
    this.context.activity[ActivityConstants.LINE_MINISTRY_OBSERVATIONS] = lineMinistryObservations;
  }

  addActorHandler(observationIndex, measureIndex) {
    const actor = {
      [ActivityConstants.ACTOR_NAME]: ''
    };
    const lineMinistryObservations = this.state.lineMinistryObservations.slice();
    lineMinistryObservations[observationIndex][ActivityConstants.MEASURES][measureIndex][ActivityConstants.ACTORS]
      .push(actor);
    this.setState({ lineMinistryObservations });
    this.context.activity[ActivityConstants.LINE_MINISTRY_OBSERVATIONS] = lineMinistryObservations;
  }

  removeObservationHandler(observationIndex) {
    const lineMinistryObservations = this.state.lineMinistryObservations.slice();
    lineMinistryObservations.splice(observationIndex, 1);
    this.setState({ lineMinistryObservations });
    this.context.activity[ActivityConstants.LINE_MINISTRY_OBSERVATIONS] = lineMinistryObservations;
  }

  removeMeasureHandler(observationIndex, measureIndex) {
    const lineMinistryObservations = this.state.lineMinistryObservations.slice();
    lineMinistryObservations[observationIndex][ActivityConstants.MEASURES].splice(measureIndex, 1);
    this.setState({ lineMinistryObservations });
    this.context.activity[ActivityConstants.LINE_MINISTRY_OBSERVATIONS] = lineMinistryObservations;
  }

  removeActorHandler(observationIndex, measureIndex, actorIndex) {
    const lineMinistryObservations = this.state.lineMinistryObservations.slice();
    lineMinistryObservations[observationIndex][ActivityConstants.MEASURES][measureIndex][ActivityConstants.ACTORS]
      .splice(actorIndex, 1);
    this.setState({ lineMinistryObservations });
    this.context.activity[ActivityConstants.LINE_MINISTRY_OBSERVATIONS] = lineMinistryObservations;
  }

  render() {
    const content = [];
    if (FeatureManager
      .isFMSettingEnabled(FeatureManagerConstants.ACTIVITY_LINE_MINISTRY_OBSERVATIONS_ADD_OBSERVATION)) {
      content.push(<Button
        bsStyle="primary"
        key={Math.random()}
        onClick={this.addObservationHandler.bind(this)}>{translate('Add Observation')}
      </Button>);
    }
    if (this.state.lineMinistryObservations) {
      this.state.lineMinistryObservations.forEach((observation, i) => {
        content.push(<Item
          observation={observation} key={Math.random()} observationIndex={i} addActor={this.addActorHandler}
          addMeasure={this.addMeasureHandler} removeObservation={this.removeObservationHandler}
          removeMeasure={this.removeMeasureHandler} removeActor={this.removeActorHandler} />);
      });
    }
    return <div>{content}</div>;
  }
}

export default AFSection(AFLineMinistryObservations, LINE_MINISTRY_OBSERVATIONS);
