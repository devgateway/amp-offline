import React, { Component, PropTypes } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import afStyles from '../ActivityForm.css';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import * as Types from '../components/AFComponentTypes';
import { IDENTIFICATION } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../utils/constants/ValueConstants';
import Logger from '../../../../modules/util/LoggerManager';
import FieldsManager from '../../../../modules/field/FieldsManager';

const logger = new Logger('AF identification');

const CUSTOM_TYPE = {
  [AC.BUDGET_CODE_PROJECT_ID]: Types.INPUT_TYPE,
  [AC.CRIS_NUMBER]: Types.INPUT_TYPE,
  [AC.GOVERNMENT_APPROVAL_PROCEDURES]: Types.RADIO_BOOLEAN
};

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
    // Show "Budget Extras" fields like ministry_code only when activity_budget is enabled and has value 'On Budget'.
    const showBudgetExtras = this.props.activityFieldsManager.isFieldPathEnabled(AC.ACTIVITY_BUDGET)
      && this.isActivityOnBudget();
    this.state = {
      showBudgetExtras
    };
    this.onActivityBudgetUpdate = this.onActivityBudgetUpdate.bind(this);
    this.mapSimpleFieldDef = this.mapSimpleFieldDef.bind(this);
  }

  onActivityBudgetUpdate() {
    this.setState({
      showBudgetExtras: this.isActivityOnBudget()
    });
  }

  isActivityOnBudget() {
    return this.props.activity[AC.ACTIVITY_BUDGET] && this.props.activity[AC.ACTIVITY_BUDGET].value === VC.ON_BUDGET;
  }

  mapSimpleFieldDef(fieldName) {
    const type = CUSTOM_TYPE[fieldName] || null;
    return <AFField key={fieldName} parent={this.props.activity} fieldPath={fieldName} type={type} />;
  }

  render() {
    // TODO update the layout per Llanoc design. If not available, adjust to work. For now grouping fields as in AMP.
    const leftColumn = [AC.ACTIVITY_STATUS, AC.STATUS_REASON, AC.PROJECT_COMMENTS, AC.OBJECTIVE, AC.LESSONS_LEARNED,
      AC.PROJECT_IMPACT, AC.ACTIVITY_SUMMARY, AC.DESCRIPTION, AC.RESULTS].map(this.mapSimpleFieldDef);
    const rightColumn = [AC.BUDGET_CODE_PROJECT_ID, AC.GOVERNMENT_APPROVAL_PROCEDURES].map(this.mapSimpleFieldDef);
    rightColumn.push(
      (<AFField
        key={AC.ACTIVITY_BUDGET}
        parent={this.props.activity} fieldPath={AC.ACTIVITY_BUDGET} onAfterUpdate={this.onActivityBudgetUpdate} />));
    if (this.state.showBudgetExtras) {
      const budgetExtras = [
        <AFField key={AC.FY} parent={this.props.activity} fieldPath={AC.FY} type={Types.MULTI_SELECT} />,
        <AFField key={AC.MINISTRY_CODE} parent={this.props.activity} fieldPath={AC.MINISTRY_CODE} forceRequired />
      ];
      rightColumn.push(<div key="budgetExtras" className={afStyles.budget_extras}>
        {budgetExtras}
      </div>);
    }
    rightColumn.push(...[AC.CRIS_NUMBER, AC.PROJECT_MANAGEMENT].map(this.mapSimpleFieldDef));

    return (
      <div className={afStyles.full_width}>
        <Grid className={afStyles.full_width}>
          <Row key="title-full-row">
            <Col md={12} lg={12}>
              <AFField key={AC.PROJECT_TITLE} parent={this.props.activity} fieldPath={AC.PROJECT_TITLE} />
            </Col>
          </Row>
          <Row key="col-split-data">
            <Col key="left-col" md={6} lg={6}>
              {leftColumn}
            </Col>
            <Col key="right-col" md={6} lg={6}>
              {rightColumn}
            </Col>
          </Row>
        </Grid>
      </div>);
  }
}

export default AFSection(AFIdentification, IDENTIFICATION);
