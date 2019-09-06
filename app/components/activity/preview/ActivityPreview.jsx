import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityPreviewUI, CurrencyRatesManager, FieldsManager } from 'amp-ui';
import translate from '../../../utils/translate';
import ActivityFundingTotals from '../../../modules/activity/ActivityFundingTotals';
import Logger from '../../../modules/util/LoggerManager';
import IconFormatter from '../../desktop/IconFormatter';
import DesktopManager from '../../../modules/desktop/DesktopManager';
import DateUtils from '../../../utils/DateUtils';
import { getAmountsInThousandsMessage, rawNumberToFormattedString } from '../../../../app/utils/NumberUtils';
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
    getAmountsInThousandsMessage: PropTypes.func.isRequired,
    IconFormatter: PropTypes.func.isRequired,
    DesktopManager: PropTypes.object.isRequired,
    APDocumentPage: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
  }

  getChildContext() {
    return {
      params: this.props.params,
      startUpReducer: this.props.startUpReducer,
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
      IconFormatter,
      DesktopManager,
      APDocumentPage,
    };
  }

  componentWillMount() {
    this.props.loadActivityForActivityPreview(this.props.params.activityId);
  }

  componentWillUnmount() {
    this.props.unloadActivity();
  }
  _getMessage() {
    const { activityReducer } = this.props;
    let message = null;
    if (activityReducer.isActivityLoading === true) {
      message = translate('activityLoading');
    } else if (activityReducer.isActivityLoaded === true) {
      if (!activityReducer.activity) {
        message = translate('activityUnexpectedError');
      }
    } else if (activityReducer.errorMessage) {
      message = `${activityReducer.errorMessage}`;
    }
    if (message !== null) {
      message = <h1>{message}</h1>;
    }
    return message;
  }

  render() {
    const message = this._getMessage();
    if (message) {
      return (<div >{message} </div>);
    } else {
      return (<ActivityPreviewUI activity={this.props.activityReducer.activity} />);
    }
  }
}
