import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Grid, Row } from 'react-bootstrap';
import Scrollspy from 'react-scrollspy';
import { ActivityConstants, CurrencyRatesManager, FeatureManager } from 'amp-ui';
import styles from './ActivityPreview.css';
import translate from '../../../utils/translate';
import SummaryGroup from './SummaryGroup';
import MainGroup from './MainGroup';
import APStatusBar from './sections/APStatusBar';
import FieldsManager from '../../../modules/field/FieldsManager';
import ActivityFundingTotals from '../../../modules/activity/ActivityFundingTotals';
import Logger from '../../../modules/util/LoggerManager';
import IconFormatter from '../../desktop/IconFormatter';
import * as WC from '../../../utils/constants/WorkspaceConstants';
import DesktopManager from '../../../modules/desktop/DesktopManager';

const logger = new Logger('Activity preview');

/**
 * Activity Preview main container
 * @author Nadejda Mandrescu
 */
export default class ActivityPreview extends Component {

  static propTypes = {
    activityReducer: PropTypes.shape({
      isActivityLoading: PropTypes.bool,
      isActivityLoaded: PropTypes.bool,
      activity: PropTypes.object,
      activityWorkspace: PropTypes.object,
      activityWSManager: PropTypes.object,
      activityFieldsManager: PropTypes.instanceOf(FieldsManager),
      activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals),
      currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager),
      currentWorkspaceSettings: PropTypes.object,
      errorMessage: PropTypes.object
    }).isRequired,
    contactReducer: PropTypes.shape({
      contactFieldsManager: PropTypes.instanceOf(FieldsManager),
      contactsByIds: PropTypes.object,
    }).isRequired,
    resourceReducer: PropTypes.object.isRequired,
    loadActivityForActivityPreview: PropTypes.func.isRequired,
    unloadActivity: PropTypes.func.isRequired,
    params: PropTypes.shape({
      activityId: PropTypes.string.isRequired
    }).isRequired,
    workspaceReducer: PropTypes.object,
    userReducer: PropTypes.object
  };

  static childContextTypes = {
    activity: PropTypes.object,
    activityWorkspace: PropTypes.object,
    activityWSManager: PropTypes.object,
    currentWorkspaceSettings: PropTypes.object,
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager),
    activityFieldsManager: PropTypes.instanceOf(FieldsManager),
    activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals),
    workspaceReducer: PropTypes.object,
    userReducer: PropTypes.object,
    contactFieldsManager: PropTypes.instanceOf(FieldsManager),
    contactsByIds: PropTypes.object,
    resourceReducer: PropTypes.object,
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
  }

  getChildContext() {
    return {
      activity: this.props.activityReducer.activity,
      activityWorkspace: this.props.activityReducer.activityWorkspace,
      activityWSManager: this.props.activityReducer.activityWSManager,
      activityFieldsManager: this.props.activityReducer.activityFieldsManager,
      contactFieldsManager: this.props.contactReducer.contactFieldsManager,
      contactsByIds: this.props.contactReducer.contactsByIds,
      currentWorkspaceSettings: this.props.activityReducer.currentWorkspaceSettings,
      activityFundingTotals: this.props.activityReducer.activityFundingTotals,
      currencyRatesManager: this.props.activityReducer.currencyRatesManager,
      resourceReducer: this.props.resourceReducer,
    };
  }

  componentWillMount() {
    this.props.loadActivityForActivityPreview(this.props.params.activityId);
  }

  componentWillUnmount() {
    this.props.unloadActivity();
  }

  _renderData() {
    const activity = this.props.activityReducer.activity;

    const categories = ActivityConstants.AP_SECTION_IDS.map((category) => {
      if (category.sectionPath
        && !this.props.activityReducer.activityFieldsManager.isFieldPathEnabled(category.sectionPath)) {
        return null;
      }
      if (category.fmPath && !FeatureManager.isFMSettingEnabled(category.fmPath)) {
        return null;
      }
      return <li key={category.value}><a href={category.hash}> {translate(category.value)} </a></li>;
    });

    const categoryKeys = ActivityConstants.AP_SECTION_IDS.map(category => category.key);

    const teamLeadFlag = this.props.userReducer.teamMember[WC.ROLE_ID] === WC.ROLE_TEAM_MEMBER_WS_MANAGER
      || this.props.userReducer.teamMember[WC.ROLE_ID] === WC.ROLE_TEAM_MEMBER_WS_APPROVER;

    const privateWSWarning = this.props.workspaceReducer.currentWorkspace[WC.IS_PRIVATE]
      ? translate('privateWorkspaceWarning') : '';

    return (
      <div className={styles.preview_container}>
        <div className={styles.preview_header} >
          <span className={styles.top_warning_text}>{privateWSWarning}</span>
          <span className={styles.preview_title} >{activity[ActivityConstants.PROJECT_TITLE]}</span>
          <span className={styles.preview_icons} >
            <ul>
              <IconFormatter
                id={activity.id} edit={!activity[ActivityConstants.REJECTED_ID]} view={false}
                status={DesktopManager.getActivityStatus(activity)}
                activityTeamId={activity[ActivityConstants.TEAM].id}
                teamId={this.props.userReducer.teamMember[WC.WORKSPACE_ID]}
                teamLeadFlag={teamLeadFlag}
                wsAccessType={this.props.workspaceReducer.currentWorkspace[WC.ACCESS_TYPE]}
                crossTeamWS={this.props.workspaceReducer.currentWorkspace[WC.CROSS_TEAM_VALIDATION]} />
            </ul>
          </span>

          <div className={styles.preview_status_container} >
            <APStatusBar
              fieldClass={styles.inline_flex}
              fieldNameClass={styles.preview_status_title} fieldValueClass={styles.preview_status_detail}
              titleClass={styles.status_title_class} groupClass={styles.status_group_class} />
          </div>
          <div className={styles.preview_categories} >
            <Scrollspy items={categoryKeys} currentClassName={styles.preview_category_selected}>
              {categories}
            </Scrollspy>
          </div>
        </div>
        <div className={styles.preview_content}>
          <Grid fluid>
            <Row>
              <Col md={9} >
                <MainGroup />
              </Col>
              <Col mdOffset={9} className={styles.preview_summary} >
                <SummaryGroup />
              </Col>
            </Row>
          </Grid>
        </div>
      </div>
    );
  }

  _hasActivity() {
    return this.props.activityReducer.activity !== undefined && this.props.activityReducer.activity !== null;
  }

  _getMessage() {
    let message = null;
    if (this.props.activityReducer.isActivityLoading === true) {
      message = translate('activityLoading');
    } else if (this.props.activityReducer.isActivityLoaded === true) {
      if (!this.props.activityReducer.activity) {
        message = translate('activityUnexpectedError');
      }
    } else if (this.props.activityReducer.errorMessage) {
      message = `${this.props.activityReducer.errorMessage}`;
    }
    return message === null ? '' : <h1>{message}</h1>;
  }

  render() {
    const activityPreview = this._hasActivity() ? this._renderData() : '';
    return (
      <div>
        {this._getMessage()}
        {activityPreview}
      </div>
    );
  }
}
