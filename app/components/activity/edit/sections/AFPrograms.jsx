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
import translate from '../../../../utils/translate';

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
      sourceProgram: undefined,
      destinationProgram: undefined };
    this.getFilterForProgramMapping(ActivityConstants.NATIONAL_PLAN_OBJECTIVE);
    this.getFilterForProgramMapping(ActivityConstants.PRIMARY_PROGRAMS);
    this.getFilterForProgramMapping(ActivityConstants.SECONDARY_PROGRAMS);
    this.getFilterForProgramMapping(ActivityConstants.TERTIAR_PROGRAMS);
  }

  /**
   * Given a fieldPath (or classification) check if it depends of another classification (from the NDD) and create a
   * filter that shows only those programs related (or mapped) with the source program.
   * @param fieldPath
   * @returns {*}
   */
  getFilterForProgramMapping(fieldPath) {
    const { activity } = this.props;
    // Find mappings where this program is the dst (right side) because the extra-info only exists in one side.
    return ProgramHelper.findAllWithProgramMapping(fieldPath).then(data => {
      if (data && data.length > 0) {
        // Find the type of the src side (NPO, PP, SP, etc) using one of the mappings.
        return ProgramHelper.findProgramClassificationByProgramId(data[0].src).then(srcType => {
          logger.log(`src: ${srcType} - dst: ${fieldPath}`);
          this.setState({ sourceProgram: srcType, destinationProgram: fieldPath });
          if (activity[srcType] && activity[srcType].length > 0) {
            // By default dont show anything.
            this.setState({ [fieldPath]: [{ path: 'value', value: 'fake-value' }] });
            const filter = [];
            activity[srcType].forEach(p => ProgramHelper.findParentStructure(p.program, srcType, [])
              .then(srcIds => {
                logger.log(srcIds);
                // Find all programs for this selector.
                return ProgramHelper.findAllProgramsByClassification(fieldPath).then(p2 => {
                  const auxId = srcIds[0].id || srcIds[0]._id;
                  const idToAdd = Object.keys(p2[0]['possible-options'])
                    .find(i => p2[0]['possible-options'][i].extra_info['mapped-program-id'] === auxId);
                  if (idToAdd) {
                    // If the program matches exactly by its mapping with an existing program then add it to the filter.
                    filter.push({ path: 'id', value: Number.parseInt(idToAdd, 10) });
                    this.setState({ [fieldPath]: filter });
                    // TODO: add its parents (use srcIds.length) to calculate how many parents show.
                  }
                  return null;
                });
              }));
          } else {
            // Since the source program is empty we cant show anything in the destination program.
            this.setState({ [fieldPath]: [{ path: 'value', value: 'fake-value' }] });
            // Also we have to remove anything selected.
            if (activity[fieldPath] && activity[fieldPath].length > 0) {
              activity[fieldPath] = [];
              this.forceUpdate();
            }
          }
          return srcType;
        });
      } else {
        this.setState({ [fieldPath]: [] });
        return null;
      }
    });
  }

  // eslint-disable-next-line react/sort-comp
  handleDelete = (type, event) => {
    const { destinationProgram, sourceProgram } = this.state;
    const { activity } = this.props;
    if (ProgramHelper.hasRelatedProgram(event.program.id, sourceProgram, destinationProgram, activity, type)) {
      alert(translate('cantDeleteMappedProgram'));
      return false;
    }
    return true;
  }

  // eslint-disable-next-line react/sort-comp
  handleChange = (event) => {
    logger.log(event);
    const { destinationProgram } = this.state;
    this.getFilterForProgramMapping(destinationProgram);
  }

  // eslint-disable-next-line class-methods-use-this
  getFilter(filter) {
    if (filter && filter.length > 0) {
      return filter;
    }
    return null;
  }


  render() {
    logger.log(this.state);
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
                extraParams={{ isORFilter: (!!this.getFilter(this.state[ActivityConstants.NATIONAL_PLAN_OBJECTIVE])) }}
                filter={this.getFilter(this.state[ActivityConstants.NATIONAL_PLAN_OBJECTIVE])}
                onBeforeDelete={this.handleDelete.bind(null, ActivityConstants.NATIONAL_PLAN_OBJECTIVE)}
                onAfterUpdate={this.handleChange} />
            </Col>
          </Row>
          <Row>
            <Col md={12} lg={12}>
              <AFField
                parent={this.props.activity} fieldPath={ActivityConstants.PRIMARY_PROGRAMS}
                extraParams={{ isORFilter: (!!this.getFilter(this.state[ActivityConstants.PRIMARY_PROGRAMS])) }}
                filter={this.state[ActivityConstants.PRIMARY_PROGRAMS]}
                onBeforeDelete={this.handleDelete.bind(null, ActivityConstants.PRIMARY_PROGRAMS)}
                onAfterUpdate={this.handleChange}
              />
            </Col>
          </Row>
          <Row>
            <Col md={12} lg={12}>
              <AFField
                parent={this.props.activity} fieldPath={ActivityConstants.SECONDARY_PROGRAMS}
                extraParams={{ isORFilter: (!!this.getFilter(this.state[ActivityConstants.SECONDARY_PROGRAMS])) }}
                filter={this.state[ActivityConstants.SECONDARY_PROGRAMS]}
                onBeforeDelete={this.handleDelete.bind(null, ActivityConstants.SECONDARY_PROGRAMS)}
                onAfterUpdate={this.handleChange} />
            </Col>
          </Row>
          <Row>
            <Col md={12} lg={12}>
              <AFField
                parent={this.props.activity} fieldPath={ActivityConstants.TERTIAR_PROGRAMS}
                extraParams={{ isORFilter: (!!this.getFilter(this.state[ActivityConstants.TERTIAR_PROGRAMS])) }}
                filter={this.state[ActivityConstants.TERTIAR_PROGRAMS]}
                onBeforeDelete={this.handleDelete.bind(null, ActivityConstants.TERTIAR_PROGRAMS)}
                onAfterUpdate={this.handleChange} />
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
