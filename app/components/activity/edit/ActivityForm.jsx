import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Button, Col, Grid, Panel, Row } from 'react-bootstrap';
import Loading from '../../common/Loading';
import * as styles from './ActivityForm.css';
import { IDENTIFICATION, SECTIONS, SECTIONS_FM_PATH } from './sections/AFSectionConstants';
import AFSectionLoader from './sections/AFSectionLoader';
import AFSaveDialog from './AFSaveDialog';
import InfoMessage from '../../common/InfoMessage';
import { AMP_ID, INTERNAL_ID, IS_DRAFT, PROJECT_TITLE } from '../../../utils/constants/ActivityConstants';
import { NEW_ACTIVITY_ID } from '../../../utils/constants/ValueConstants';
import { FUNDING_ACTIVE_LIST } from '../../../utils/constants/FieldPathConstants';
import ActivityFieldsManager from '../../../modules/activity/ActivityFieldsManager';
import ActivityFundingTotals from '../../../modules/activity/ActivityFundingTotals';
import ActivityValidator from '../../../modules/activity/ActivityValidator';
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
      validationResult: PropTypes.array,
      isActivitySaved: PropTypes.bool
    }).isRequired,
    userReducer: PropTypes.object.isRequired,
    loadActivityForActivityForm: PropTypes.func.isRequired,
    unloadActivity: PropTypes.func.isRequired,
    saveActivity: PropTypes.func.isRequired,
    reportActivityValidation: PropTypes.func.isRequired,
    params: PropTypes.shape({
      activityId: PropTypes.string
    }).isRequired,
    router: PropTypes.object
  };

  static childContextTypes = {
    activity: PropTypes.object,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager),
    activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals),
    activityValidator: PropTypes.instanceOf(ActivityValidator),
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
      activityValidator: this.activityValidator,
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
      this.activityValidator = new ActivityValidator(nextProps.activityReducer.activityFieldsManager);
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
      <Button
        key={sectionName} onClick={this._selectSection.bind(this, sectionName)} bsStyle="link" block
        className={this.state.currentSection === sectionName ? styles.quick_links_highlight
          : styles.quick_links_button} >
        <div className={styles.quick_links} >{translate(sectionName)}</div>
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
    // TODO to adjust oonce AMP-XXX is fixed to properly define activive
    const fieldPathsToSkipSet = new Set([AMP_ID, INTERNAL_ID, FUNDING_ACTIVE_LIST]);
    this.activity[IS_DRAFT] = asDraft;
    const errors = this.activityValidator.areAllConstraintsMet(this.activity, asDraft, fieldPathsToSkipSet);
    if (errors.length) {
      let errorDetails = errors.map(e => `[${e.path}]: ${e.errorMessage}`).join('. ');
      errorDetails = errorDetails.length > 1000 ? `${errorDetails.substring(0, 1000)}...` : errorDetails;
      validationError = `${translate('afFieldsGeneralError')} Details: ${errorDetails}`;
      LoggerManager.error(validationError);
    }
    this.props.reportActivityValidation(errors);
    this.showSaveDialog = asDraft && !validationError;
    this.setState({ isSaveAndSubmit: !asDraft, validationError });
    if (!asDraft && !validationError) {
      this.props.saveActivity(this.activity);
      this.props.router.push(`/desktop/${this.props.userReducer.teamMember.id}`);
    }
  }

  _renderSaveDialog() {
    if (!this.showSaveDialog) {
      return null;
    }
    this.showSaveDialog = false;
    return (
      <AFSaveDialog
        activity={this.activity}
        actionTitle={translate('Save as draft')}
        saveActivity={this.props.saveActivity}
        teamMemberId={this.props.userReducer.teamMember.id}
      />
    );
  }

  _renderActions() {
    const previewUrl = `/activity/preview/${this.props.params.activityId}`;
    return (
      <div>
        <div className={styles.general_header} >{translate('Actions')}</div>
        <div>
          <Button
            bsClass={styles.action_button} key="submit"
            onClick={this._saveActivity.bind(this, false)} block >{translate('Save and Submit')}
          </Button>
          <Button
            bsClass={styles.action_button} key="saveAsDraft"
            onClick={this._saveActivity.bind(this, true)} block >{translate('Save as draft')}
          </Button>
          <Button
            key="preview" bsClass={styles.action_button} disabled={this.state.isNewActivity} block >
            <Link to={previewUrl} title={translate('Preview')} >
              {translate('Preview')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  _renderActivity() {
    const projectTitle = this.props.activityReducer.activityFieldsManager.getValue(this.activity, PROJECT_TITLE);
    const sucessfulSaveMessage = this.props.activityReducer.isActivitySaved
      ? <InfoMessage message={translate('Activity saved successfully')} timeout={5000} /> : null;
    return (
      <div className={styles.form_content} >
        {sucessfulSaveMessage}
        <Grid fluid >
          <Row >
            <Col>{this._renderSaveDialog()}</Col>
          </Row>
          <Row>
            <Col md={10} >
              <div className={styles.form_main_content} >
                <div className={styles.general_header} >
                  {translate('Edit Activity Form')}({ projectTitle })
                </div>
                <div>{AFSectionLoader(this.state.currentSection)}</div>
              </div>
            </Col>
            <Col mdOffset={10} >
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
