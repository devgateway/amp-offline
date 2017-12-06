import React, { Component, PropTypes } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import afStyles from '../ActivityForm.css';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { RICH_TEXT_AREA } from '../components/AFComponentTypes';
import { IDENTIFICATION } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../utils/constants/ValueConstants';
import Logger from '../../../../modules/util/LoggerManager';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';

const logger = new Logger('AF identification');

/**
 * Identification Section
 * @author Nadejda Mandrescu
 */
class AFIdentification extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    // Show ministry_code only when activity_budget is enabled and has value 'On Budget'.
    const showMinistryCode = (this.props.activityFieldsManager.isFieldPathEnabled(AC.ACTIVITY_BUDGET)
      && this.props.activity[AC.ACTIVITY_BUDGET]
      && this.props.activity[AC.ACTIVITY_BUDGET].value === VC.ON_BUDGET);
    this.state = {
      showMinistryCode
    };
    this.onActivityBudgetUpdate = this.onActivityBudgetUpdate.bind(this);
  }

  onActivityBudgetUpdate() {
    const showMinistryCode = this.props.activity[AC.ACTIVITY_BUDGET] &&
      this.props.activity[AC.ACTIVITY_BUDGET].value === VC.ON_BUDGET;
    this.setState({
      showMinistryCode
    });
  }

  render() {
    // TODO update the layout per Llanoc design. If not available, adjust to work. For now grouping fields as in AMP.
    return (
      <div className={afStyles.full_width} >
        <Grid className={afStyles.full_width} >
          <Row>
            <Col md={12} lg={12} >
              <AFField parent={this.props.activity} fieldPath={AC.PROJECT_TITLE} />
            </Col>
          </Row>
          <Row>
            <Col md={6} lg={6} >
              <div>
                <AFField parent={this.props.activity} fieldPath={AC.ACTIVITY_STATUS} />
              </div>
              <div>
                <AFField parent={this.props.activity} fieldPath={AC.STATUS_REASON} />
              </div>
              <div >
                <AFField parent={this.props.activity} fieldPath={AC.OBJECTIVE} type={RICH_TEXT_AREA} />
              </div>
              <div>
                <AFField parent={this.props.activity} fieldPath={AC.LESSONS_LEARNED} />
              </div>
              <div>
                <AFField parent={this.props.activity} fieldPath={AC.PROJECT_IMPACT} />
              </div>
              <div>
                <AFField parent={this.props.activity} fieldPath={AC.ACTIVITY_SUMMARY} />
              </div>
            </Col>
            <Col md={6} lg={6} >
              <div>
                <AFField
                  parent={this.props.activity} fieldPath={AC.ACTIVITY_BUDGET}
                  onAfterUpdate={this.onActivityBudgetUpdate} />
              </div>
              <div>
                {(this.state.showMinistryCode) ?
                  <AFField parent={this.props.activity} fieldPath={AC.MINISTRY_CODE} forceRequired /> : null}
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={6} lg={6} >
              <div>
                <AFField parent={this.props.activity} fieldPath={AC.DESCRIPTION} />
              </div>
            </Col>
            <Col md={6} lg={6} >
              <div>
                <AFField parent={this.props.activity} fieldPath={AC.PROJECT_MANAGEMENT} />
              </div>
            </Col>
          </Row>
        </Grid>
      </div>);
  }
}

export default AFSection(AFIdentification, IDENTIFICATION);
