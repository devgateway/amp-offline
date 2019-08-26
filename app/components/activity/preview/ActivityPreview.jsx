import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityPreviewUI, CurrencyRatesManager, FieldsManager } from 'amp-ui';
import translate from '../../../utils/translate';
import ActivityFundingTotals from '../../../modules/activity/ActivityFundingTotals';
import Logger from '../../../modules/util/LoggerManager';
import IconFormatter from '../../desktop/IconFormatter';
import DesktopManager from '../../../modules/desktop/DesktopManager';
import DateUtils from '../../../utils/DateUtils';
import { rawNumberToFormattedString, getAmountsInThousandsMessage } from '../../../../app/utils/NumberUtils';
import { getActivityContactIds } from '../../../actions/ContactAction';
import { APDocumentPage } from '../../../containers/ResourcePage';

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
    userReducer: PropTypes.object,
    startUpReducer: PropTypes.object
  };

  static childContextTypes = {
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
    loadActivityForActivityPreview: PropTypes.func.isRequired,
    unloadActivity: PropTypes.func.isRequired,
    params: PropTypes.shape({
      activityId: PropTypes.string.isRequired
    }).isRequired,
    startUpReducer: PropTypes.object,
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
    calendar: PropTypes.object,
    Logger: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired,
    DateUtils: PropTypes.func.isRequired,
    rawNumberToFormattedString: PropTypes.func.isRequired,
    getActivityContactIds: PropTypes.func.isRequired,
    getAmountsInThousandsMessage: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
  }

  getChildContext() {
    return {
      activityReducer: this.props.activityReducer,
      contactReducer: this.props.contactReducer,
      loadActivityForActivityPreview: this.props.loadActivityForActivityPreview,
      unloadActivity: this.props.unloadActivity,
      params: this.props.params,
      startUpReducer: this.props.startUpReducer,
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
      calendar: this.props.startUpReducer.calendar,
      workspaceReducer: this.props.workspaceReducer,
      userReducer: this.props.userReducer,
      Logger,
      translate,
      DateUtils,
      rawNumberToFormattedString,
      getActivityContactIds,
      getAmountsInThousandsMessage,
    };
  }

  componentWillMount() {
    this.props.loadActivityForActivityPreview(this.props.params.activityId);
  }

  componentWillUnmount() {
    this.props.unloadActivity();
  }

  render() {
    return (<ActivityPreviewUI
      IconFormatter={IconFormatter}
      DesktopManager={DesktopManager} APDocumentPage={APDocumentPage} />);
  }
}
