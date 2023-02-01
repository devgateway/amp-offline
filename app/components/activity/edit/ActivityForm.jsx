import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Button, Col, Grid, Panel, Row } from 'react-bootstrap';
import {
  ActivityConstants, CurrencyRatesManager, ValueConstants, FieldPathConstants, FieldsManager, FeatureManager,
  PossibleValuesManager, Loading, Constants
} from 'amp-ui';
import * as styles from './ActivityForm.css';
import { FIELDS_PER_SECTIONS, IDENTIFICATION, SECTIONS, SECTIONS_FM_PATH } from './sections/AFSectionConstants';
import AFSectionLoader from './sections/AFSectionLoader';
import AFSaveDialog from './AFSaveDialog';
import ActivityFundingTotals from '../../../modules/activity/ActivityFundingTotals';
import ActivityValidator from '../../../modules/field/EntityValidator';
import translate from '../../../utils/translate';
import Logger from '../../../modules/util/LoggerManager';

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
      activityFieldsManager: PropTypes.instanceOf(FieldsManager),
      activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals),
      errorMessage: PropTypes.object,
      validationResult: PropTypes.array,
      fieldValidationResult: PropTypes.object,
      isActivitySaved: PropTypes.bool,
      otherProjectTitles: PropTypes.array,
      currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager),
      currentWorkspaceSettings: PropTypes.object
    }).isRequired,
    loadActivityForActivityForm: PropTypes.func.isRequired,
    unloadActivity: PropTypes.func.isRequired,
    saveActivity: PropTypes.func.isRequired,
    unableToSave: PropTypes.func.isRequired,
    reportActivityValidation: PropTypes.func.isRequired,
    params: PropTypes.shape({
      activityId: PropTypes.string
    }).isRequired,
    router: PropTypes.object,
    workspaceReducer: PropTypes.object
  };

  static childContextTypes = {
    activity: PropTypes.object,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager),
    activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals),
    activityValidator: PropTypes.instanceOf(ActivityValidator),
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager),
    currentWorkspaceSettings: PropTypes.object,
    activityFundingSectionPanelStatus: PropTypes.array,
    workspaceReducer: PropTypes.object
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this._toggleQuickLinks = this._toggleQuickLinks.bind(this);
  }

  getChildContext() {
    return {
      activity: this.activity,
      activityFieldsManager: this.props.activityReducer.activityFieldsManager,
      activityFundingTotals: this.props.activityReducer.activityFundingTotals,
      activityValidator: this.activityValidator,
      currencyRatesManager: this.props.activityReducer.currencyRatesManager,
      currentWorkspaceSettings: this.props.activityReducer.currentWorkspaceSettings,
      activityFundingSectionPanelStatus: this.activityFundingSectionPanelStatus,
      workspaceReducer: this.props.workspaceReducer
    };
  }

  componentWillMount() {
    this.init(this.props.params.activityId);
  }

  init(activityId) { // eslint-disable-line react/sort-comp
    this.activity = undefined;
    this.activityFundingSectionPanelStatus = [];
    this.props.loadActivityForActivityForm(activityId);
    this.setState({
      activityId,
      isNewActivity: activityId === ValueConstants.NEW_ACTIVITY_ID,
      quickLinksExpanded: true,
      currentSection: undefined,
      content: undefined,
      sectionsWithErrors: [],
      validationError: null,
      showSaveDialog: false,
      isSaving: false,
      isGoToDesktop: false,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { activityFieldsManager, otherProjectTitles, activity, savedActivity } = nextProps.activityReducer;
    const { isSaving, isGoToDesktop } = this.state;
    if (isSaving && savedActivity) {
      if (isGoToDesktop) {
        this.activity = null;
        this.props.router.push('/desktop/current');
        return;
      } else {
        this.setState({ isSaving: false });
      }
    }
    const activityId = nextProps.params && nextProps.params.activityId;
    // normally it means "Add Activity" was called from within AF, otherwise activityId must not change
    if (this.state.activityId !== undefined && activityId !== undefined && this.state.activityId !== activityId) {
      this.props.unloadActivity();
      this.init(activityId);
      return;
    }
    if (activityFieldsManager) {
      this.activityValidator = new ActivityValidator(activity, activityFieldsManager, otherProjectTitles, null,
        this.props.workspaceReducer.currentWorkspace[Constants.PREFIX_FIELD]);
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
        this.activityValidator.entity = activity;
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
    console.log(this.state.quickLinksExpanded);
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
        className={linkStyle}>
        <div className={textStyle}>{translate(sectionName)}</div>
      </Button>);
    });
    return (
      <div>
        <Button bsClass={styles.quick_links_toggle} onClick={this._toggleQuickLinks} block>
          <div className={styles.general_header}>{this._getQuickLinksHeader()}</div>
        </Button>
        <Panel defaultExpanded expanded={this.state.quickLinksExpanded}>
          <Panel.Collapse>
            <Panel.Body>
              <div>
                {sectionLinks}
              </div>
            </Panel.Body>
          </Panel.Collapse>
        </Panel>
      </div>
    );
  }

  _validateAndSubmit() {
    const validationError = this._validateActivity(false);
    if (!validationError) {
      this._saveActivity(false, true);
    } else {
      this.props.unableToSave('validationErrorOnSave');
    }
  }

  _validateAndShowSaveAsDraftDialog() {
    const validationError = this._validateActivity(true);
    if (!validationError) {
      this.setState({ showSaveDialog: true });
    } else {
      this.props.unableToSave('validationErrorOnSave');
    }
  }

  _validateActivity(asDraft) {
    let validationError;
    // TODO to adjust this list once is fixed to properly define activity
    const fieldPathsToSkipSet = new Set([ ActivityConstants.AMP_ID,
      ActivityConstants.INTERNAL_ID, FieldPathConstants.FUNDING_ACTIVE_LIST ]);
    this.activity[ActivityConstants.IS_DRAFT] = asDraft;
    if (this.activity[ActivityConstants.MULTI_STAKEHOLDER_PARTNERSHIP] !== true) {
      fieldPathsToSkipSet.add(ActivityConstants.MULTI_STAKEHOLDER_PARTNERS);
    }
    const errors = this.activityValidator.areAllConstraintsMet(this.activity, asDraft, fieldPathsToSkipSet);
    if (errors.length) {
      validationError = this._handleSaveErrors(errors);
    }
    this.props.reportActivityValidation(errors);
    this.setState({ validationError });
    return validationError;
  }

  _saveActivity(asDraft, isGoToDesktop) {
    this.setState({ showSaveDialog: false, isSaving: true, isGoToDesktop });
    this.props.saveActivity(this.activity);
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
    if (!this.state.showSaveDialog) {
      return null;
    }
    return (
      <AFSaveDialog
        actionTitle={translate('Save as draft')}
        saveActivity={this._saveActivity.bind(this, true)}
        onClose={() => this.setState({ showSaveDialog: false })}
      />
    );
  }

  _renderActions() {
    const { isNewActivity } = this.state;
    const disablePreview = typeof isNewActivity === 'undefined' || isNewActivity;

    const previewUrl = `/activity/preview/${this.props.params.activityId}`;
    return (
      <div>
        <div className={styles.general_header}>{translate('Actions')}</div>
        <div>
          <Button
            bsClass={styles.action_button} key="submit"
            onClick={this._validateAndSubmit.bind(this)} block>{translate('Save and Submit')}
          </Button>
          <Button
            bsClass={styles.action_button} key="saveAsDraft"
            onClick={this._validateAndShowSaveAsDraftDialog.bind(this)} block>{translate('Save as draft')}
          </Button>
          <Link to={previewUrl} title={translate('Preview')}>
            <Button
              key="preview"
              bsClass={styles.action_button}
              disabled={disablePreview}
              block
            >{translate('Preview')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  _renderActivity() {
    const { activityFieldsManager } = this.props.activityReducer;
    const projectTitle = activityFieldsManager.getValue(this.activity, ActivityConstants.PROJECT_TITLE,
      PossibleValuesManager.getOptionTranslation);

    return (
      <div className={styles.form_content}>
        <Grid fluid>
          <Row>
            <Col>{this._renderSaveDialog()}</Col>
          </Row>
          <Row>
            <Col xs={8} sm={8}>
              <div className={styles.form_main_content}>
                <div className={styles.general_header}>
                  {translate('Edit Activity Form')}
                  {projectTitle && `(${projectTitle})`}
                </div>
                <div
                  ref={(mainContent => {
                    this.mainContent = mainContent;
                  })}>
                  {AFSectionLoader(this.state.currentSection)}
                </div>
              </div>
            </Col>
            <Col xs={2} sm={2}>
              <div className={styles.actions}>
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
    return <Loading Logger={Logger} translate={translate} />;
  }
}
