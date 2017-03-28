import React, { Component, PropTypes } from 'react';
import styles from './ActivityPreview.css';
import translate from '../../../utils/translate';
import * as AC from '../../../utils/constants/ActivityConstants';
import SummaryGroup from './SummaryGroup';
import ActivityFieldsManager from '../../../modules/activity/ActivityFieldsManager';
import ActivityFundingTotals from '../../../modules/activity/ActivityFundingTotals';

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
      activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager),
      activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals),
      errorMessage: PropTypes.string
    }).isRequired,
    loadActivityForActivityPreview: PropTypes.func.isRequired,
    params: {
      activityId: PropTypes.string.isRequired
    }
  };

  constructor(props) {
    super(props);
    console.log('constructor');
  }

  componentWillMount() {
    this.props.loadActivityForActivityPreview(this.props.params.activityId);
  }

  _renderData() {
    const activity = this.props.activityReducer.activity;
    const actReducer = {
      activityFieldsManager: this.props.activityReducer.activityFieldsManager,
      activityFundingTotals: this.props.activityReducer.activityFundingTotals
    };
    return (
      <div className={styles.preview_container}>
        <div className={styles.preview_header}>
          <span className={styles.section_title}>{activity[AC.PROJECT_TITLE]}</span>
        </div>
        <div>
          <table>
            <tr>
              <td width={30}>
                <SummaryGroup activityReducer={actReducer} />
              </td>
              <td width={70}>
                <span>right data</span>
              </td>
            </tr>
          </table>
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
