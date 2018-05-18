import React, { Component, PropTypes } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import afStyles from '../ActivityForm.css';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { IDENTIFICATION } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../utils/constants/ValueConstants';
import Logger from '../../../../modules/util/LoggerManager';
import FieldsManager from '../../../../modules/field/FieldsManager';

const logger = new Logger('AF identification');

/**
 * Identification Section
 * @author Nadejda Mandrescu
 */
class AFIdentification extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired
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
    this.mapSimpleFieldDef = this.mapSimpleFieldDef.bind(this);
  }

  onActivityBudgetUpdate() {
    const showMinistryCode = this.props.activity[AC.ACTIVITY_BUDGET] &&
      this.props.activity[AC.ACTIVITY_BUDGET].value === VC.ON_BUDGET;
    this.setState({
      showMinistryCode
    });
  }

  mapSimpleFieldDef(fieldName) {
    return <AFField parent={this.props.activity} fieldPath={fieldName} />;
  }

  render() {
    // TODO update the layout per Llanoc design. If not available, adjust to work. For now grouping fields as in AMP.
    const leftColumn = [AC.ACTIVITY_STATUS, AC.STATUS_REASON, AC.OBJECTIVE, AC.LESSONS_LEARNED, AC.PROJECT_IMPACT,
      AC.ACTIVITY_SUMMARY, AC.DESCRIPTION, AC.RESULTS].map(this.mapSimpleFieldDef);
    const rightColumn = [AC.BUDGET_CODE_PROJECT_ID].map(this.mapSimpleFieldDef);
    rightColumn.push(
      (<AFField
        parent={this.props.activity} fieldPath={AC.ACTIVITY_BUDGET} onAfterUpdate={this.onActivityBudgetUpdate} />));
    if (this.state.showMinistryCode) {
      rightColumn.push(<AFField parent={this.props.activity} fieldPath={AC.MINISTRY_CODE} forceRequired />);
    }
    rightColumn.push(...[AC.CRIS_NUMBER, AC.PROJECT_MANAGEMENT].map(this.mapSimpleFieldDef));

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
              {leftColumn}
            </Col>
            <Col md={6} lg={6} >
              {rightColumn}
            </Col>
          </Row>
        </Grid>
      </div>);
  }
}

export default AFSection(AFIdentification, IDENTIFICATION);
