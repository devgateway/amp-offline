import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Checkbox, Col, Grid, Row } from 'react-bootstrap';
import { ActivityConstants, FeatureManagerConstants, FeatureManager } from 'amp-ui';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import afStyles from '../ActivityForm.css';
import { PLANNING } from './AFSectionConstants';
import Logger from '../../../../modules/util/LoggerManager';
import translate from '../../../../utils/translate';
import { updateActivityGlobalState } from '../../../../actions/ActivityAction';
import DateUtils from '../../../../utils/DateUtils';

const SAME_AS_FM_PATH = {};
SAME_AS_FM_PATH[ActivityConstants.SAME_AS_PROPOSED_START_DATE_LABEL] =
  FeatureManagerConstants.ACTIVITY_SAME_AS_PROPOSED_START_DATE;
SAME_AS_FM_PATH[ActivityConstants.SAME_AS_PROPOSED_APPROVAL_DATE_LABEL] =
  FeatureManagerConstants.ACTIVITY_SAME_AS_PROPOSED_APPROVAL_DATE;

const logger = new Logger('AF Planning');

/**
 * Planning Section
 * @author Nadejda Mandrescu
 */
class AFPlanning extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired,
    globalState: PropTypes.object.isRequired,
    onUpdateGlobalState: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.copyIfChecked = this.copyIfChecked.bind(this);
  }

  componentWillMount() {
    // remember this only once, even if you navigate away and then back, to replicate AMP AF online behavior
    if (this.props.globalState[ActivityConstants.SAME_AS_PROPOSED_START_DATE_LABEL] === undefined) {
      this.initGlobalState();
    }
  }

  initGlobalState() { // eslint-disable-line
    this.props.onUpdateGlobalState(ActivityConstants.ACTUAL_START_DATE,
      this.props.activity[ActivityConstants.ACTUAL_START_DATE]);
    this.props.onUpdateGlobalState(ActivityConstants.ACTUAL_APPROVAL_DATE,
      this.props.activity[ActivityConstants.ACTUAL_APPROVAL_DATE]);
    this.props.onUpdateGlobalState(ActivityConstants.SAME_AS_PROPOSED_START_DATE_LABEL, false);
    this.props.onUpdateGlobalState(ActivityConstants.SAME_AS_PROPOSED_APPROVAL_DATE_LABEL, false);
  }

  getSameAsAction(label, copyFrom, copyTo) {
    if (FeatureManager.isFMSettingEnabled(SAME_AS_FM_PATH[label], false)) {
      const isChecked = !!this.props.globalState[label];
      return (
        <Checkbox defaultChecked={isChecked} onChange={this.sameAs.bind(this, label, copyFrom, copyTo)}>
          {translate(label)}
        </Checkbox>);
    }
    return null;
  }

  sameAs(label, copyFrom, copyTo, e) {
    const isChecked = e.target.checked;
    this.copySameValue(isChecked, copyFrom, copyTo);
    this.props.onUpdateGlobalState(label, isChecked);
  }

  copySameValue(isChecked, copyFrom, copyTo) {
    const copyToEl = document.querySelector(`#id_${copyTo} input`);
    const copyFromEl = isChecked ? document.querySelector(`#id_${copyFrom} input`) : null;
    const globalCopyToValue = this.props.globalState[copyTo];
    if (isChecked) {
      copyToEl.value = copyFromEl.value;
    } else {
      copyToEl.value = globalCopyToValue ? DateUtils.createFormattedDate(globalCopyToValue) : '';
    }
    this.props.activity[copyTo] = isChecked ? this.props.activity[copyFrom] : globalCopyToValue;
  }

  copyIfChecked(label, copyFrom, copyTo) {
    if (this.props.globalState[label]) {
      this.copySameValue(true, copyFrom, copyTo);
    }
  }

  render() {
    const asPAD = [ActivityConstants.SAME_AS_PROPOSED_APPROVAL_DATE_LABEL, ActivityConstants.PROPOSED_APPROVAL_DATE,
      ActivityConstants.ACTUAL_APPROVAL_DATE];
    const asPSD = [ActivityConstants.SAME_AS_PROPOSED_START_DATE_LABEL, ActivityConstants.PROPOSED_START_DATE,
      ActivityConstants.ACTUAL_START_DATE];
    return (<div className={afStyles.full_width}>
      <Grid className={afStyles.full_width}>
        <Row>
          <Col md={6} lg={6}>
            <AFField parent={this.props.activity} fieldPath={ActivityConstants.LINE_MINISTRY_RANK} />
            <AFField
              parent={this.props.activity} fieldPath={ActivityConstants.PROPOSED_APPROVAL_DATE}
              id={`id_${ActivityConstants.PROPOSED_APPROVAL_DATE}`}
              onAfterUpdate={() => this.copyIfChecked(...asPAD)} />
            <AFField
              parent={this.props.activity} fieldPath={ActivityConstants.ACTUAL_APPROVAL_DATE}
              id={`id_${ActivityConstants.ACTUAL_APPROVAL_DATE}`} />
            {this.getSameAsAction(...asPAD)}
            <AFField parent={this.props.activity} fieldPath={ActivityConstants.FINAL_DATE_FOR_CONTRACTING} />
            <AFField
              parent={this.props.activity} fieldPath={ActivityConstants.PROPOSED_START_DATE}
              id={`id_${ActivityConstants.PROPOSED_START_DATE}`}
              onAfterUpdate={() => this.copyIfChecked(...asPSD)} />
            <AFField
              parent={this.props.activity} fieldPath={ActivityConstants.ACTUAL_START_DATE}
              id={`id_${ActivityConstants.ACTUAL_START_DATE}`} />
            {this.getSameAsAction(...asPSD)}
          </Col>
          <Col md={6} lg={6}>
            <AFField parent={this.props.activity} fieldPath={ActivityConstants.ORIGINAL_COMPLETION_DATE} />
            <AFField parent={this.props.activity} fieldPath={ActivityConstants.PROPOSED_COMPLETION_DATE} />
            <AFField parent={this.props.activity} fieldPath={ActivityConstants.FINAL_DATE_FOR_DISBURSEMENTS} />
            <AFField parent={this.props.activity} fieldPath={ActivityConstants.ACTUAL_COMPLETION_DATE} />
          </Col>
        </Row>
      </Grid>
    </div>);
  }
}

export default connect(
  state => ({
    globalState: state.activityReducer.globalState
  }),
  dispatch => ({
    onUpdateGlobalState: (setting, value) => dispatch(updateActivityGlobalState(setting, value))
  })
)(AFSection(AFPlanning, PLANNING));
