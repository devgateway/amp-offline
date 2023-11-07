import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Clearfix, Col, Grid, Row } from 'react-bootstrap';
import { ActivityConstants, ValueConstants, FieldsManager } from 'amp-ui';
import afStyles from '../ActivityForm.css';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import * as Types from '../components/AFComponentTypes';
import { IDENTIFICATION } from './AFSectionConstants';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AF identification');

const CUSTOM_TYPE = {
  [ActivityConstants.BUDGET_CODE_PROJECT_ID]: Types.INPUT_TYPE,
  [ActivityConstants.CRIS_NUMBER]: Types.INPUT_TYPE,
  [ActivityConstants.GOVERNMENT_APPROVAL_PROCEDURES]: Types.RADIO_BOOLEAN,
  [ActivityConstants.GOVERNMENT_AGREEMENT_NUMBER]: Types.INPUT_TYPE,
  [ActivityConstants.JOINT_CRITERIA]: Types.RADIO_BOOLEAN,
  [ActivityConstants.HUMANITARIAN_AID]: Types.RADIO_BOOLEAN,
  [ActivityConstants.FINANCIAL_INSTRUMENT]: Types.MULTI_SELECT,
  [ActivityConstants.IATI_IDENTIFIER]: Types.INPUT_TYPE,
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
    logger.debug('constructor');
    const { activityFieldsManager } = this.props;
    // Show "Budget Extras" fields like ministry_code only when activity_budget is enabled and has value 'On Budget'.
    const showBudgetExtras = activityFieldsManager.isFieldPathEnabled(ActivityConstants.ACTIVITY_BUDGET)
      && this.isActivityOnBudget();
    const showStakeHolderPartners = activityFieldsManager
        .isFieldPathEnabled(ActivityConstants.MULTI_STAKEHOLDER_PARTNERSHIP) && this.isMultiHoldersPartnership();
    this.state = {
      showBudgetExtras,
      showStakeHolderPartners
    };
    this.onActivityBudgetUpdate = this.onActivityBudgetUpdate.bind(this);
    this.mapSimpleFieldDef = this.mapSimpleFieldDef.bind(this);
  }

  onActivityBudgetUpdate() {
    this.setState({
      showBudgetExtras: this.isActivityOnBudget()
    });
  }

  onStakeHolderPartnershipChange(object, b) {
    if (b === true) {
      this.setState({ showStakeHolderPartners: true });
    } else {
      this.setState({ showStakeHolderPartners: false });
    }
  }

  mapSimpleFieldDef(fieldName) {
    const type = CUSTOM_TYPE[fieldName] || null;
    return <AFField key={fieldName} parent={this.props.activity} fieldPath={fieldName} type={type} />;
  }

  isActivityOnBudget() {
    return this.props.activity[ActivityConstants.ACTIVITY_BUDGET] &&
      this.props.activity[ActivityConstants.ACTIVITY_BUDGET].value === ValueConstants.ON_BUDGET;
  }

  isMultiHoldersPartnership() {
    const { activity } = this.props;
    return activity[ActivityConstants.MULTI_STAKEHOLDER_PARTNERSHIP] &&
      activity[ActivityConstants.MULTI_STAKEHOLDER_PARTNERSHIP].value === true;
  }

  render() {
    // TODO update the layout per Llanoc design. If not available, adjust to work. For now grouping fields as in AMP.
    const leftColumn = [ActivityConstants.ACTIVITY_STATUS, ActivityConstants.STATUS_REASON,
      ActivityConstants.PROJECT_COMMENTS, ActivityConstants.OBJECTIVE, ActivityConstants.LESSONS_LEARNED,
      ActivityConstants.PROJECT_IMPACT, ActivityConstants.ACTIVITY_SUMMARY, ActivityConstants.DESCRIPTION,
      ActivityConstants.RESULTS].map(this.mapSimpleFieldDef);
    const rightColumn = [ActivityConstants.BUDGET_CODE_PROJECT_ID, ActivityConstants.A_C_CHAPTER]
      .map(this.mapSimpleFieldDef);
    rightColumn.push(
      (<AFField
        key={ActivityConstants.ACTIVITY_BUDGET}
        parent={this.props.activity} fieldPath={ActivityConstants.ACTIVITY_BUDGET}
        onAfterUpdate={this.onActivityBudgetUpdate} />));
    rightColumn.push(...[ActivityConstants.GOVERNMENT_APPROVAL_PROCEDURES, ActivityConstants.JOINT_CRITERIA,
      ActivityConstants.HUMANITARIAN_AID]
      .map(this.mapSimpleFieldDef));
    if (this.state.showBudgetExtras) {
      const budgetExtras = [
        <AFField
          key={ActivityConstants.INDIRECT_ON_BUDGET} parent={this.props.activity}
          fieldPath={ActivityConstants.INDIRECT_ON_BUDGET}
          type={Types.CHECKBOX} />,
        <AFField
          key={ActivityConstants.FY} parent={this.props.activity} fieldPath={ActivityConstants.FY}
          type={Types.MULTI_SELECT} />,
        <AFField
          key={ActivityConstants.MINISTRY_CODE} parent={this.props.activity}
          fieldPath={ActivityConstants.MINISTRY_CODE} showRequired />,
        <AFField
          key={ActivityConstants.PROJECT_CODE} parent={this.props.activity} fieldPath={ActivityConstants.PROJECT_CODE}
          type={Types.INPUT_TYPE}
          showRequired />,
        <AFField
          key={ActivityConstants.VOTE} parent={this.props.activity} fieldPath={ActivityConstants.VOTE}
          type={Types.INPUT_TYPE}
          showRequired />,
        <AFField
          key={ActivityConstants.SUB_VOTE} parent={this.props.activity} fieldPath={ActivityConstants.SUB_VOTE}
          type={Types.INPUT_TYPE}
          showRequired />,
        <AFField
          key={ActivityConstants.SUB_PROGRAM} parent={this.props.activity} fieldPath={ActivityConstants.SUB_PROGRAM}
          type={Types.INPUT_TYPE}
          showRequired />
      ];
      rightColumn.push(<div key="budgetExtras" className={afStyles.budget_extras}>
        {budgetExtras}
      </div>);
    }
    rightColumn.push(...[ActivityConstants.FINANCIAL_INSTRUMENT, ActivityConstants.CRIS_NUMBER,
      ActivityConstants.PROJECT_MANAGEMENT, ActivityConstants.GOVERNMENT_AGREEMENT_NUMBER,
      ActivityConstants.IATI_IDENTIFIER]
      .map(this.mapSimpleFieldDef));

    return (
      <div className={afStyles.full_width}>
        <Grid className={afStyles.full_width}>
          <Row key="title-full-row">
            <Col xs={12}>
              <AFField
                key={ActivityConstants.PROJECT_TITLE} parent={this.props.activity}
                fieldPath={ActivityConstants.PROJECT_TITLE} />
            </Col>
          </Row>
          <Row key="col-split-data">
            <Col key="left-col" md={6} sm={12}>
              {leftColumn}
              <AFField
                key={ActivityConstants.MULTI_STAKEHOLDER_PARTNERSHIP} parent={this.props.activity}
                fieldPath={ActivityConstants.MULTI_STAKEHOLDER_PARTNERSHIP} type={Types.RADIO_BOOLEAN}
                customLabel="multi_stakeholder_partnership"
                onAfterUpdate={this.onStakeHolderPartnershipChange.bind(this,
                  ActivityConstants.MULTI_STAKEHOLDER_PARTNERSHIP)} />
              {this.state.showStakeHolderPartners ? <AFField
                key={ActivityConstants.MULTI_STAKEHOLDER_PARTNERS} parent={this.props.activity}
                fieldPath={ActivityConstants.MULTI_STAKEHOLDER_PARTNERS} /> : null}
            </Col>
            <Clearfix visibleSmBlock />
            <Col key="right-col" md={6} sm={12}>
              {rightColumn}
            </Col>
          </Row>
        </Grid>
      </div>);
  }
}

export default AFSection(AFIdentification, IDENTIFICATION);
