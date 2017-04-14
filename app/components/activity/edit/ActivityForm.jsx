import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { Button, Panel } from 'react-bootstrap';
import Loading from '../../common/Loading';
import * as styles from './ActivityForm.css';
import { SECTIONS, IDENTIFICATION } from './sections/AFSectionConstants';
import AFSectionLoader from './sections/AFSectionLoader';
import AFSaveDialog from './AFSaveDialog';
import ErrorMessage from '../../common/ErrorMessage';
import { PROJECT_TITLE, IS_DRAFT, AMP_ID, INTERNAL_ID } from '../../../utils/constants/ActivityConstants';
import { NEW_ACTIVITY_ID } from '../../../utils/constants/ValueConstants';
import ActivityFieldsManager from '../../../modules/activity/ActivityFieldsManager';
import ActivityFundingTotals from '../../../modules/activity/ActivityFundingTotals';
import translate from '../../../utils/translate';
import LoggerManager from '../../../modules/util/LoggerManager';

/**
 * Activity Form
 * @author Nadejda Mandrescu
 */
export default class ActivityForm extends Component {

  static propTypes = {
    activityReducer: PropTypes.shape({
      isActivityLoading: PropTypes.bool,
      isActivityLoaded: PropTypes.bool,
      isActivitySaving: PropTypes.bool,
      activity: PropTypes.object,
      savedActivity: PropTypes.object,
      activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager),
      activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals),
      errorMessage: PropTypes.object
    }).isRequired,
    user: PropTypes.object.isRequired,
    loadActivityForActivityForm: PropTypes.func.isRequired,
    unloadActivity: PropTypes.func.isRequired,
    saveActivity: PropTypes.func.isRequired,
    params: PropTypes.shape({
      activityId: PropTypes.string
    }).isRequired
  };

  static childContextTypes ={
    activity: PropTypes.object,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager),
    activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals),
    isSaveAndSubmit: PropTypes.bool
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.activity = undefined;
    this.showSaveDialog = false;
    this._toggleQuickLinks = this._toggleQuickLinks.bind(this);
  }

  getChildContext() {
    return {
      activity: this.activity,
      activityFieldsManager: this.props.activityReducer.activityFieldsManager,
      activityFundingTotals: this.props.activityReducer.activityFundingTotals,
      isSaveAndSubmit: this.state.isSaveAndSubmit
    };
  }

  componentWillMount() {
    this.props.loadActivityForActivityForm(this.props.params.activityId);
    this.setState({
      isNewActivity: this.props.params.activityId === NEW_ACTIVITY_ID,
      quickLinksExpanded: true,
      currentSection: undefined,
      content: undefined,
      validationError: null,
      isSaveAndSubmit: false
    });
  }

  componentWillReceiveProps(nextProps) {
    if ((!this.activity && nextProps.activityReducer.activity) || nextProps.activityReducer.savedActivity) {
      if (nextProps.activityReducer.savedActivity) {
        this.activity = undefined;
        this.props.loadActivityForActivityForm(nextProps.activityReducer.savedActivity.id);
      } else {
        this.activity = nextProps.activityReducer.activity;
        this._selectSection(IDENTIFICATION);
      }
    }
  }

  componentWillUnmount() {
    this.props.unloadActivity();
  }

  _getQuickLinksHeader() {
    return `${this.state.quickLinksExpanded ? '-' : '+'} ${translate('Quick Links')}`;
  }

  _toggleQuickLinks() {
    this.setState({
      quickLinksExpanded: !this.state.quickLinksExpanded
    });
  }

  _selectSection(sectionName) {
    this.setState({
      currentSection: sectionName
    });
  }

  _renderQuickLinks() {
    const sectionLinks = SECTIONS.map(sectionName =>
      <Button key={sectionName} onClick={this._selectSection.bind(this, sectionName)} bsStyle="link" block>
        {translate(sectionName)}
      </Button>);
    return (
      <div>
        <Button bsClass={styles.quick_links_toggle} onClick={this._toggleQuickLinks} block >
          <div className={styles.general_header} >{this._getQuickLinksHeader()}</div>
        </Button>
        <Panel collapsible defaultExpanded expanded={this.state.quickLinksExpanded} >
          {sectionLinks}
        </Panel>
      </div>
    );
  }

  _saveActivity(asDraft) {
    let validationError;
    const fieldPathsToSkipSet = new Set([AMP_ID, INTERNAL_ID]);
    const invalidFieldPaths = new Set();
    this.activity[IS_DRAFT] = asDraft;
    if (!this.props.activityReducer.activityFieldsManager.areRequiredFieldsSpecified(this.activity, asDraft,
        fieldPathsToSkipSet, invalidFieldPaths)) {
      // TODO either do not display field paths or map them to user friendly message
      validationError = `${translate('Please provide all required fields')}: ${invalidFieldPaths.toJSON()}`;
    }
    this.showSaveDialog = !validationError;
    this.setState({ isSaveAndSubmit: !asDraft, validationError });
  }

  _renderSaveDialog() {
    if (!this.showSaveDialog) {
      return null;
    }
    this.showSaveDialog = false;
    const actionTitle = this.state.isSaveAndSubmit ? translate('Save and Submit') : translate('Save as draft');
    return (<AFSaveDialog
      activity={this.activity} actionTitle={actionTitle} saveActivity={this.props.saveActivity}
      teamMemberId={this.props.user.teamMember.id}
    />);
  }

  _renderActions() {
    const previewUrl = `/activity/preview/${this.props.params.activityId}`;
    return (
      <div>
        <div className={styles.general_header}>{translate('Actions')}</div>
        <div>
          <Button key="submit" onClick={this._saveActivity.bind(this, false)} block >{translate('Save and Submit')}
          </Button>
          <Button key="saveAsDraft" onClick={this._saveActivity.bind(this, true)} block >{translate('Save as draft')}
          </Button>
          <Button key="preview" disabled={this.state.isNewActivity} block>
            <Link to={previewUrl} title={translate('Preview')}>
              {translate('Preview')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  _renderActivity() {
    const projectTitle = this.props.activityReducer.activityFieldsManager.getValue(this.activity, PROJECT_TITLE);
    const errorMessage = this.state.validationError ? <ErrorMessage message={this.state.validationError} /> : null;
    // TODO saved successful when staying on page
    return (
      <div>
        {errorMessage}
        <table className={styles.form_content}>
          <tbody className={styles.table}>
            <tr><td>{this._renderSaveDialog()}</td></tr>
            <tr>
              <td className={styles.form_main_content}>
                <div className={styles.general_header}>
                  {translate('Edit Activity Form')}({ projectTitle })
                </div>
                <div>{AFSectionLoader(this.state.currentSection)}</div>
              </td>
              <td className={styles.actions}>
                {this._renderQuickLinks()}
                {this._renderActions()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    if (this.props.activityReducer.isActivityLoading || this.props.activityReducer.isActivitySaving || !this.activity) {
      return <Loading />;
    }
    if (this.activity) {
      return this._renderActivity();
    }
    return <div />;
  }

}