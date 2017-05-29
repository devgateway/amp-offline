import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { Button, Panel, Grid, Row, Col } from 'react-bootstrap';
import Loading from '../../common/Loading';
import * as styles from './ActivityForm.css';
import { SECTIONS, IDENTIFICATION, SECTIONS_FM_PATH } from './sections/AFSectionConstants';
import AFSectionLoader from './sections/AFSectionLoader';
import AFSaveDialog from './AFSaveDialog';
import ErrorMessage from '../../common/ErrorMessage';
import InfoMessage from '../../common/InfoMessage';
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
      errorMessage: PropTypes.object,
      isActivitySaved: PropTypes.bool
    }).isRequired,
    userReducer: PropTypes.object.isRequired,
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
    if (nextProps.activityReducer.activityFieldsManager) {
      this.sections = SECTIONS.map(name => {
        const fmPath = SECTIONS_FM_PATH[name];
        if (!fmPath || nextProps.activityReducer.activityFieldsManager.isFieldPathEnabled(fmPath)) {
          return name;
        }
        return null;
      }).filter(name => name);
    }
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
    const sectionLinks = this.sections.map(sectionName =>
      <Button key={sectionName} onClick={this._selectSection.bind(this, sectionName)} bsStyle="link" block >
        <div className={styles.quick_links}>{translate(sectionName)}</div>
      </Button>);
    return (
      <div>
        <Button bsClass={styles.quick_links_toggle} onClick={this._toggleQuickLinks} block >
          <div className={styles.general_header} >{this._getQuickLinksHeader()}</div>
        </Button>
        <Panel collapsible defaultExpanded expanded={this.state.quickLinksExpanded} >
          <div >
            {sectionLinks}
          </div>
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
      // Show a simple list of failing fields using the user-friendly name of them.
      const errorsToLabel = invalidFieldPaths.toJSON()
        .map(item => (this.props.activityReducer.activityFieldsManager.getFieldLabelTranslation(item)))
        .join(', ');
      validationError = `${translate('Please provide all required fields')}: ${errorsToLabel}`;
    }
    this.showSaveDialog = asDraft;
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
      teamMemberId={this.props.userReducer.teamMember.id}
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
    const sucessfulSaveMessage = this.props.activityReducer.isActivitySaved
      ? <InfoMessage message={translate('Activity saved successfully')} timeout={5000} /> : null;
    return (
      <div className={styles.form_content} >
        {errorMessage}
        {sucessfulSaveMessage}
        <Grid fluid >
          <Row >
            <Col>{this._renderSaveDialog()}</Col>
          </Row>
          <Row>
            <Col md={10}>
              <div className={styles.form_main_content} >
                <div className={styles.general_header} >
                  {translate('Edit Activity Form')}({ projectTitle })
                </div>
                <div>{AFSectionLoader(this.state.currentSection)}</div>
              </div>
            </Col>
            <Col mdOffset={10}>
              <div className={styles.actions} >
                {this._renderQuickLinks()}
                {this._renderActions()}
              </div>
            </Col>
          </Row>
        </Grid>
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
