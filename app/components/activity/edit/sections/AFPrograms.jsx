import React, { Component, PropTypes } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import { ActivityConstants } from 'amp-ui';
import afStyles from '../ActivityForm.css';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { PROGRAM } from './AFSectionConstants';
import Logger from '../../../../modules/util/LoggerManager';
import * as Types from '../components/AFComponentTypes';
import ProgramHelper from '../../../../modules/helpers/ProgramHelper';

const logger = new Logger('AF programs');

/**
 * Programs Section
 * @author Nadejda Mandrescu
 */
class AFPrograms extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.state = { [ActivityConstants.NATIONAL_PLAN_OBJECTIVE]: undefined,
      [ActivityConstants.PRIMARY_PROGRAMS]: undefined,
      [ActivityConstants.SECONDARY_PROGRAMS]: undefined,
      [ActivityConstants.TERTIAR_PROGRAMS]: undefined };
    this.getFilterForProgramMapping(ActivityConstants.NATIONAL_PLAN_OBJECTIVE);
    this.getFilterForProgramMapping(ActivityConstants.PRIMARY_PROGRAMS);
    this.getFilterForProgramMapping(ActivityConstants.SECONDARY_PROGRAMS);
    this.getFilterForProgramMapping(ActivityConstants.TERTIAR_PROGRAMS);
  }

  getFilterForProgramMapping(fieldPath) {
    return ProgramHelper.findAllWithProgramMapping(fieldPath).then(data => {
      logger.info(data);
      this.setState({ [fieldPath]: data });
      return data;
    });
  }

  render() {
    if (this.state[ActivityConstants.NATIONAL_PLAN_OBJECTIVE] !== undefined
        && this.state[ActivityConstants.PRIMARY_PROGRAMS] !== undefined
        && this.state[ActivityConstants.SECONDARY_PROGRAMS] !== undefined
        && this.state[ActivityConstants.TERTIAR_PROGRAMS] !== undefined) {
      debugger
      return (<div className={afStyles.full_width}>
        <Grid className={afStyles.full_width}>
          <Row>
            <Col md={12} lg={12}>
              <AFField parent={this.props.activity} fieldPath={ActivityConstants.NATIONAL_PLAN_OBJECTIVE} />
            </Col>
          </Row>
          <Row>
            <Col md={12} lg={12}>
              <AFField
                parent={this.props.activity} fieldPath={ActivityConstants.PRIMARY_PROGRAMS}
              />
            </Col>
          </Row>
          <Row>
            <Col md={12} lg={12}>
              <AFField parent={this.props.activity} fieldPath={ActivityConstants.SECONDARY_PROGRAMS} />
            </Col>
          </Row>
          <Row>
            <Col md={12} lg={12}>
              <AFField parent={this.props.activity} fieldPath={ActivityConstants.TERTIAR_PROGRAMS} />
            </Col>
          </Row>
          <Row>
            <Col md={12} lg={12}>
              <AFField
                key={'program_description'} parent={this.props.activity}
                fieldPath={'program_description'} type={Types.RICH_TEXT_AREA} />
            </Col>
          </Row>
        </Grid>
      </div>);
    }
    return null;
  }
}

export default AFSection(AFPrograms, PROGRAM);
