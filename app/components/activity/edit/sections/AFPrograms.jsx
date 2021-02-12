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
      [ActivityConstants.TERTIAR_PROGRAMS]: undefined,
      sourceProgram: undefined };
    this.getFilterForProgramMapping(ActivityConstants.NATIONAL_PLAN_OBJECTIVE);
    this.getFilterForProgramMapping(ActivityConstants.PRIMARY_PROGRAMS);
    this.getFilterForProgramMapping(ActivityConstants.SECONDARY_PROGRAMS);
    this.getFilterForProgramMapping(ActivityConstants.TERTIAR_PROGRAMS);
  }

  getFilterForProgramMapping(fieldPath) {
    const { activity } = this.props;
    return ProgramHelper.findAllWithProgramMapping(fieldPath).then(data => {
      if (data && data.length > 0) {
        return ProgramHelper.findProgramClassificationByProgramId(data[0].src).then(type => {
          console.log(`${fieldPath} - ${type}`);
          this.setState({ sourceProgram: type });
          if (activity[type] && activity[type].length > 0) {
            const filter = [];
            activity[type].forEach(p => ProgramHelper.findParentStructure(p.program, type, [])
              .then(ids => {
                console.log(ids);
                return ProgramHelper.findProgramsByClassification(fieldPath).then(p2 => {
                  const auxId = ids[0].id || ids[0]._id;
                  const idToAdd = Object.keys(p2[0]['possible-options'])
                    .find(i => p2[0]['possible-options'][i].extra_info['mapped-program-id'] === auxId);
                  if (idToAdd) {
                    filter.push({ path: 'id', value: Number.parseInt(idToAdd, 10) });
                    this.setState({ [fieldPath]: filter });
                  }
                  // TODO: add its parents.
                  return null;
                });
              }));
          } else {
            // Since the source program is empty we cant show anything in the destination program.
            this.setState({ [fieldPath]: [{ path: 'value', value: 'fake-value' }] });
          }
          return type;
        });
      } else {
        this.setState({ [fieldPath]: [] });
        return null;
      }
    });
  }

  render() {
    if (this.state[ActivityConstants.NATIONAL_PLAN_OBJECTIVE] !== undefined
        && this.state[ActivityConstants.PRIMARY_PROGRAMS] !== undefined
        && this.state[ActivityConstants.SECONDARY_PROGRAMS] !== undefined
        && this.state[ActivityConstants.TERTIAR_PROGRAMS] !== undefined) {
      return (<div className={afStyles.full_width}>
        <Grid className={afStyles.full_width}>
          <Row>
            <Col md={12} lg={12}>
              <AFField
                parent={this.props.activity} fieldPath={ActivityConstants.NATIONAL_PLAN_OBJECTIVE}
                filter={this.state[ActivityConstants.NATIONAL_PLAN_OBJECTIVE]} />
            </Col>
          </Row>
          <Row>
            <Col md={12} lg={12}>
              <AFField
                parent={this.props.activity} fieldPath={ActivityConstants.PRIMARY_PROGRAMS}
                filter={this.state[ActivityConstants.PRIMARY_PROGRAMS]}
              />
            </Col>
          </Row>
          <Row>
            <Col md={12} lg={12}>
              <AFField
                parent={this.props.activity} fieldPath={ActivityConstants.SECONDARY_PROGRAMS}
                filter={this.state[ActivityConstants.SECONDARY_PROGRAMS]} />
            </Col>
          </Row>
          <Row>
            <Col md={12} lg={12}>
              <AFField
                parent={this.props.activity} fieldPath={ActivityConstants.TERTIAR_PROGRAMS}
                filter={this.state[ActivityConstants.TERTIAR_PROGRAMS]} />
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
