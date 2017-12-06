import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Button, Col, Grid, Panel, Row } from 'react-bootstrap';
import Loading from '../../common/Loading';
import * as styles from './ActivityForm.css';
import { IDENTIFICATION, SECTIONS, SECTIONS_FM_PATH, FIELDS_PER_SECTIONS } from './sections/AFSectionConstants';
import AFSectionLoader from './sections/AFSectionLoader';
import AFSaveDialog from './AFSaveDialog';
import { AMP_ID, INTERNAL_ID, IS_DRAFT, PROJECT_TITLE } from '../../../utils/constants/ActivityConstants';
import { NEW_ACTIVITY_ID } from '../../../utils/constants/ValueConstants';
import { FUNDING_ACTIVE_LIST } from '../../../utils/constants/FieldPathConstants';
import ActivityFieldsManager from '../../../modules/activity/ActivityFieldsManager';
import ActivityFundingTotals from '../../../modules/activity/ActivityFundingTotals';
import ActivityValidator from '../../../modules/activity/ActivityValidator';
import translate from '../../../utils/translate';
import Logger from '../../../modules/util/LoggerManager';
import CurrencyRatesManager from '../../../modules/util/CurrencyRatesManager';
import FeatureManager from '../../../modules/util/FeatureManager';

const logger = new Logger('Activity form');

/* eslint-disable class-methods-use-this */

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
      fieldValidationResult: PropTypes.object,
      isActivitySaved: PropTypes.bool,
      otherProjectTitles: PropTypes.array,
      currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager),
      currentWorkspaceSettings: PropTypes.object
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
    isSaveAndSubmit: PropTypes.bool,
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager),
    currentWorkspaceSettings: PropTypes.object
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.showSaveDialog = false;
    this._toggleQuickLinks = this._toggleQuickLinks.bind(this);
  }

  getChildContext() {
    return {
      activity: this.activity,
      activityFieldsManager: this.props.activityReducer.activityFieldsManager,
      activityFundingTotals: this.props.activityReducer.activityFundingTotals,
      activityValidator: this.activityValidator,
      isSaveAndSubmit: this.state.isSaveAndSubmit,
      currencyRatesManager: this.props.activityReducer.currencyRatesManager,
      currentWorkspaceSettings: this.props.activityReducer.currentWorkspaceSettings
    };
  }

  componentWillMount() {
    this.init(this.props.params.activityId);
  }

  init(activityId) { // eslint-disable-line react/sort-comp
    this.activity = undefined;
    this.props.loadActivityForActivityForm(activityId);
    this.setState({
      activityId,
      isNewActivity: activityId === NEW_ACTIVITY_ID,
      quickLinksExpanded: true,
      currentSection: undefined,
      content: undefined,
      sectionsWithErrors: [],
      validationError: null,
      isSaveAndSubmit: false
    });
  }

  componentWillReceiveProps(nextProps) {
    const { activityFieldsManager, otherProjectTitles, activity, savedActivity } = nextProps.activityReducer;
    const activityId = nextProps.params && nextProps.params.activityId;
    // normally it means "Add Activity" was called from within AF, otherwise activityId must not change
    if (this.state.activityId !== undefined && activityId !== undefined && this.state.activityId !== activityId) {
      this.props.unloadActivity();
      this.init(activityId);
      return;
    }
    if (activityFieldsManager) {
      this.activityValidator = new ActivityValidator(activity, activityFieldsManager, otherProjectTitles);
      this.sections = SECTIONS.map(name => {
        const fmPath = SECTIONS_FM_PATH[name];
        if (!fmPath) {
          return name;
        } else if (activityFieldsManager.isFieldPathEnabled(fmPath) || FeatureManager.isFMSettingEnabled(fmPath)) {
          return name;
        }
        return null;
      }).filter(name => name);
    }
    if ((!this.activity && activity) || savedActivity) {
      if (savedActivity) {
        this.activity = undefined;
        this.props.loadActivityForActivityForm(savedActivity.id);
      } else {
        this.activity = activity;
        this.activityValidator.activity = activity;
        this._selectSection(IDENTIFICATION);
      }
    }
  }

  componentDidUpdate() {
    if (this.jumpToError) {
      this.jumpToError = false;
      const elementsWithError = this.mainContent.getElementsByClassName('has-error');
      if (elementsWithError && elementsWithError.length) {
        elementsWithError[0].scrollIntoView();
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
    const sectionsWithErrors = this.state.sectionsWithErrors.filter(sWithErrors => sWithErrors !== sectionName);
    this.setState({
      currentSection: sectionName,
      sectionsWithErrors
    });
  }

  _renderQuickLinks() {
    const { currentSection, sectionsWithErrors } = this.state;
    const sectionLinks = this.sections && this.sections.map(sectionName => {
      const linkStyle = currentSection === sectionName ? styles.quick_links_highlight : styles.quick_links_button;
      const textStyle = `${styles.quick_links} 
      ${sectionsWithErrors.includes(sectionName) && currentSection !== sectionName ? styles.quick_links_required : ''}`;
      return (<Button
        key={sectionName} onClick={this._selectSection.bind(this, sectionName)} bsStyle="link" block
        className={linkStyle} >
        <div className={textStyle} >{translate(sectionName)}</div>
      </Button>);
    });
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
      validationError = this._handleSaveErrors(errors);
    }
    this.props.reportActivityValidation(errors);
    this.showSaveDialog = asDraft && !validationError;
    this.setState({ isSaveAndSubmit: !asDraft, validationError });
    if (!asDraft && !validationError) {
      this.props.saveActivity(this.activity);
      this.props.router.push(`/desktop/${this.props.userReducer.teamMember.id}`);
    }
  }

  _handleSaveErrors(errors) {
    const sectionsWithErrors = this._getSectionsWithErrors(errors);
    if (sectionsWithErrors.length && this.state.currentSection !== sectionsWithErrors[0]) {
      this._selectSection(sectionsWithErrors.shift());
    }
    this.setState({ sectionsWithErrors });
    // storing as a non state, since it will be used without rerendering
    this.jumpToError = true;
    let errorDetails = errors.map(e => `[${e.path}]: ${e.errorMessage}`).join('. ');
    errorDetails = errorDetails.length > 1000 ? `${errorDetails.substring(0, 1000)}...` : errorDetails;
    const validationError = `${translate('afFieldsGeneralError')} Details: ${errorDetails}`;
    logger.error(validationError);
    return validationError;
  }

  _getSectionsWithErrors(errors) {
    const errorRoots = errors.map(error => error.path.split('~')[0]);
    return SECTIONS.filter(sectionName => {
      const fieldRoots = FIELDS_PER_SECTIONS[sectionName];
      return fieldRoots && errorRoots.some(errorRoot => fieldRoots.has(errorRoot));
    });
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
    const { isNewActivity } = this.state;
    const disablePreview = typeof isNewActivity === 'undefined' || isNewActivity;

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
            key="preview"
            bsClass={styles.action_button}
            disabled={disablePreview}
            block
          >
            <Link to={previewUrl} title={translate('Preview')} >
              {translate('Preview')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  _renderActivity() {
    const { activityFieldsManager } = this.props.activityReducer;
    const projectTitle = activityFieldsManager.getValue(this.activity, PROJECT_TITLE);

    return (
      <div className={styles.form_content} >
        <Grid fluid >
          <Row >
            <Col>{this._renderSaveDialog()}</Col>
          </Row>
          <Row>
            <Col md={10} >
              <div className={styles.form_main_content} >
                <div className={styles.general_header} >
                  {translate('Edit Activity Form')}
                  {projectTitle && `(${projectTitle})`}
                </div>
                <div ref={(mainContent => { this.mainContent = mainContent; })}>
                  {AFSectionLoader(this.state.currentSection)}
                </div>
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
    if (this.props.activityReducer.isActivityLoaded && this.activity) {
      return this._renderActivity();
    }
    // TODO report errors if not loading and not loaded
    return <Loading />;
  }
}
