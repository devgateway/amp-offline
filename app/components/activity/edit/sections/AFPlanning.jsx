import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Checkbox, Col, Grid, Row } from 'react-bootstrap';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import afStyles from '../ActivityForm.css';
import { PLANNING } from './AFSectionConstants';
import {
  ACTUAL_APPROVAL_DATE,
  ACTUAL_COMPLETION_DATE,
  ACTUAL_START_DATE,
  FINAL_DATE_FOR_CONTRACTING,
  FINAL_DATE_FOR_DISBURSEMENTS,
  LINE_MINISTRY_RANK,
  ORIGINAL_COMPLETION_DATE,
  PROPOSED_APPROVAL_DATE,
  PROPOSED_COMPLETION_DATE,
  PROPOSED_START_DATE,
  SAME_AS_PROPOSED_APPROVAL_DATE_LABEL,
  SAME_AS_PROPOSED_START_DATE_LABEL
} from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';
import {
  ACTIVITY_SAME_AS_PROPOSED_APPROVAL_DATE,
  ACTIVITY_SAME_AS_PROPOSED_START_DATE
} from '../../../../utils/constants/FeatureManagerConstants';
import FeatureManager from '../../../../modules/util/FeatureManager';
import translate from '../../../../utils/translate';
import { updateActivityGlobalState } from '../../../../actions/ActivityAction';
import DateUtils from '../../../../utils/DateUtils';

const SAME_AS_FM_PATH = {};
SAME_AS_FM_PATH[SAME_AS_PROPOSED_START_DATE_LABEL] = ACTIVITY_SAME_AS_PROPOSED_START_DATE;
SAME_AS_FM_PATH[SAME_AS_PROPOSED_APPROVAL_DATE_LABEL] = ACTIVITY_SAME_AS_PROPOSED_APPROVAL_DATE;

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
    LoggerManager.log('constructor');
    this.copyIfChecked = this.copyIfChecked.bind(this);
  }

  componentWillMount() {
    // remember this only once, even if you navigate away and then back, to replicate AMP AF online behavior
    if (this.props.globalState[SAME_AS_PROPOSED_START_DATE_LABEL] === undefined) {
      this.initGlobalState();
    }
  }

  initGlobalState() { // eslint-disable-line
    this.props.onUpdateGlobalState(ACTUAL_START_DATE, this.props.activity[ACTUAL_START_DATE]);
    this.props.onUpdateGlobalState(ACTUAL_APPROVAL_DATE, this.props.activity[ACTUAL_APPROVAL_DATE]);
    this.props.onUpdateGlobalState(SAME_AS_PROPOSED_START_DATE_LABEL, false);
    this.props.onUpdateGlobalState(SAME_AS_PROPOSED_APPROVAL_DATE_LABEL, false);
  }

  getSameAsAction(label, copyFrom, copyTo) {
    if (FeatureManager.isFMSettingEnabled(SAME_AS_FM_PATH[label], false)) {
      const isChecked = !!this.props.globalState[label];
      return (
        <Checkbox defaultChecked={isChecked} onChange={this.sameAs.bind(this, label, copyFrom, copyTo)} >
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
    copyToEl.value = isChecked ? copyFromEl.value : DateUtils.createFormattedDate(this.props.globalState[copyTo]);
    this.props.activity[copyTo] = isChecked ? this.props.activity[copyFrom] : this.props.globalState[copyTo];
  }

  copyIfChecked(label, copyFrom, copyTo) {
    if (this.props.globalState[label]) {
      this.copySameValue(true, copyFrom, copyTo);
    }
  }

  render() {
    const asPAD = [SAME_AS_PROPOSED_APPROVAL_DATE_LABEL, PROPOSED_APPROVAL_DATE, ACTUAL_APPROVAL_DATE];
    const asPSD = [SAME_AS_PROPOSED_START_DATE_LABEL, PROPOSED_START_DATE, ACTUAL_START_DATE];
    return (<div className={afStyles.full_width} >
      <Grid className={afStyles.full_width} >
        <Row>
          <Col md={6} lg={6} >
            <AFField parent={this.props.activity} fieldPath={LINE_MINISTRY_RANK} />
            <AFField
              parent={this.props.activity} fieldPath={PROPOSED_APPROVAL_DATE} id={`id_${PROPOSED_APPROVAL_DATE}`}
              onAfterUpdate={() => this.copyIfChecked(...asPAD)} />
            <AFField parent={this.props.activity} fieldPath={ACTUAL_APPROVAL_DATE} id={`id_${ACTUAL_APPROVAL_DATE}`} />
            {this.getSameAsAction(...asPAD)}
            <AFField parent={this.props.activity} fieldPath={FINAL_DATE_FOR_CONTRACTING} />
            <AFField
              parent={this.props.activity} fieldPath={PROPOSED_START_DATE} id={`id_${PROPOSED_START_DATE}`}
              onAfterUpdate={() => this.copyIfChecked(...asPSD)} />
            <AFField parent={this.props.activity} fieldPath={ACTUAL_START_DATE} id={`id_${ACTUAL_START_DATE}`} />
            {this.getSameAsAction(...asPSD)}
          </Col>
          <Col md={6} lg={6} >
            <AFField parent={this.props.activity} fieldPath={ORIGINAL_COMPLETION_DATE} />
            <AFField parent={this.props.activity} fieldPath={PROPOSED_COMPLETION_DATE} />
            <AFField parent={this.props.activity} fieldPath={FINAL_DATE_FOR_DISBURSEMENTS} />
            <AFField parent={this.props.activity} fieldPath={ACTUAL_COMPLETION_DATE} />
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
