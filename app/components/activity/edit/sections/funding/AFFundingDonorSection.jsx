/* eslint-disable class-methods-use-this */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable react/no-unused-prop-types */
import React, { Component, PropTypes } from 'react';
import { Button, Panel } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import Logger from '../../../../../modules/util/LoggerManager';
import FieldsManager from '../../../../../modules/field/FieldsManager';
import translate from '../../../../../utils/translate';
import AFFundingContainer from './AFFundingContainer';
import AFField from '../../components/AFField';
import styles from './AFFundingDonorSection.css';
import fundingStyles from './AFFunding.css';
import * as Types from '../../components/AFComponentTypes';
import * as Utils from '../../../../../utils/Utils';
import AFUtils from '../../util/AFUtils';

const logger = new Logger('AF funding donor section');

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingDonorSection extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    activity: PropTypes.object.isRequired,
    activityFundingSectionPanelStatus: PropTypes.array.isRequired
  };

  static propTypes = {
    fundings: PropTypes.array.isRequired,
    organization: PropTypes.object.isRequired,
    role: PropTypes.object.isRequired,
    removeFundingItem: PropTypes.func.isRequired,
    addFundingItem: PropTypes.func.isRequired,
    hasErrors: PropTypes.func.isRequired,
    refreshAfterChildChanges: PropTypes.func.isRequired,
    tabIndex: PropTypes.number.isRequired
  };

  constructor(props, context) {
    super(props, context);
    logger.log('constructor');
    // We manage the open/close state of these panels or they will have problems when nested panels.
    const openFundingsState = [];
    const filteredFundings = this._filterFundings(this.props.fundings);
    filteredFundings.map((f) => (openFundingsState.push({
      open: (f.open !== undefined ? f.open : true),
      id: f[AC.GROUP_VERSIONED_FUNDING],
      fundingClassificationOpen: false
    })));
    this.state = {
      fundingList: filteredFundings,
      showingErrors: props.fundings.some(f => this._checkChildrenForErrors(f)),
      refresh: 0
    };
    this._addNewFundingItem = this._addNewFundingItem.bind(this);
    this._refreshAfterChildChanges = this._refreshAfterChildChanges.bind(this);
    this._checkChildrenForErrors = this._checkChildrenForErrors.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // Expand the section that has errors.
    nextProps.fundings.forEach(f => {
      if (this._checkChildrenForErrors(f)) {
        const funding = this._findFundingById(f[AC.GROUP_VERSIONED_FUNDING]);
        funding.open = true; // TODO: esto realmente agrega el field open?
      }
    });
    this.setState({
      refresh: Math.random(),
      fundingList: this._filterFundings(nextProps.fundings)
    });
  }

  _checkChildrenForErrors(f) {
    const { hasErrors } = this.props;
    return (hasErrors(f) || hasErrors(f[AC.FUNDING_DETAILS]) || hasErrors(f[AC.MTEF_PROJECTIONS]));
  }

  _addNewFundingItem() {
    logger.log('_addNewFundingItem');
    // Since Funding Item belongs to a "Funding Tab" we can inherit that info.
    const fundingItem = {};
    fundingItem[AC.FUNDING_DONOR_ORG_ID] = this.props.organization;
    if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.FUNDINGS}~${AC.SOURCE_ROLE}`)) {
      fundingItem[AC.SOURCE_ROLE] = this.props.role;
    }
    fundingItem[AC.FUNDING_DETAILS] = [];
    fundingItem[AC.GROUP_VERSIONED_FUNDING] = Utils.numberRandom();

    // Open/Closed state for Panels.
    fundingItem.open = true;
    fundingItem.fundingClassificationOpen = false;
    fundingItem.commitmentsStatusOpen = false;
    fundingItem.disbursementsStatusOpen = false;
    fundingItem.expendituresStatusOpen = false;

    const newFundingList = this.state.fundingList.slice();
    newFundingList.push(fundingItem);
    this.setState({ fundingList: newFundingList });

    // Add to activity object or it will disappear when changing section.
    if (!this.context.activity[AC.FUNDINGS]) {
      this.context.activity[AC.FUNDINGS] = [];
    }
    this.context.activity[AC.FUNDINGS].push(fundingItem);

    // Keep AFFunding state in sync.
    this.props.addFundingItem();
  }

  _removeFundingItem(id, orgTypeName) {
    logger.log('_removeFundingItem');
    if (confirm(translate('deleteFundingItem'))) {
      const { activity } = this.context;
      const newFundingList = this.state.fundingList.slice();
      const index0 = newFundingList.findIndex((item) => (item[AC.GROUP_VERSIONED_FUNDING] === id));
      newFundingList.splice(index0, 1);
      this.setState({ fundingList: newFundingList });

      const index = activity[AC.FUNDINGS].findIndex((item) => (item[AC.GROUP_VERSIONED_FUNDING] === id));
      const organization = activity[AC.FUNDINGS][index][AC.FUNDING_DONOR_ORG_ID];
      // Remove from the activity.
      const index2 = activity[AC.FUNDINGS].findIndex((item) => (item[AC.GROUP_VERSIONED_FUNDING] === id));
      activity[AC.FUNDINGS].splice(index2, 1);

      // Delete organization if add funding auto is enabled and it doesnt have more fundings.
      const orgTypeCode = AFUtils.findOrgTypeCodeByName(orgTypeName);
      let addAutoFundingEnabledAndEmpty = false;
      if (AFUtils.checkIfAutoAddFundingEnabled(orgTypeCode)) {
        if (!AFUtils.checkIfOrganizationAndOrgTypeHasFunding(orgTypeName, organization,
          this.context.activityFieldsManager, activity)) {
          addAutoFundingEnabledAndEmpty = true;
          const newOrganizationsList = activity[orgTypeCode] ? activity[orgTypeCode].slice() : [];
          const orgIndex = newOrganizationsList.findIndex(o => o[AC.ORGANIZATION].id === organization.id);
          newOrganizationsList.splice(orgIndex, 1);
          activity[orgTypeCode] = newOrganizationsList;
        }
      }

      // Keep AFFunding state in sync.
      this.props.removeFundingItem(addAutoFundingEnabledAndEmpty);
    }
  }

  _filterFundings(fundings) {
    // If source_role is disabled then we filter only by organization.
    const filterSourceRole = this.context.activityFieldsManager.isFieldPathEnabled(`${AC.FUNDINGS}~${AC.SOURCE_ROLE}`);
    return fundings.filter(f => (f[AC.FUNDING_DONOR_ORG_ID].id === this.props.organization.id
      && (filterSourceRole ? f[AC.SOURCE_ROLE].id === this.props.role.id : true)));
  }

  _generateComplexHeader(i, funding) {
    // TODO: AFFields objects are not being refreshed (use a bind function?).
    const orgTypeName = funding[AC.SOURCE_ROLE] ? funding[AC.SOURCE_ROLE].value : null;
    const suffix = ' |';
    return (<div
      className={this._checkChildrenForErrors(funding) ? fundingStyles.error : ''}>
      <div>{`${translate('Funding Item')} ${i + 1}`}</div>
      <div className={styles.header}>
        <AFField
          fieldPath={`${AC.FUNDINGS}~${AC.TYPE_OF_ASSISTANCE}`} parent={funding}
          className={styles.header_small_item} showLabel={false} type={Types.LABEL} showRequired={false}
          extraParams={{ suffix }} />
        <AFField
          fieldPath={`${AC.FUNDINGS}~${AC.FINANCING_INSTRUMENT}`} parent={funding}
          className={styles.header_small_item} showLabel={false} type={Types.LABEL} showRequired={false}
          extraParams={{ suffix }} />
        <AFField
          fieldPath={`${AC.FUNDINGS}~${AC.FINANCING_ID}`} parent={funding}
          className={styles.header_small_item} showLabel={false} type={Types.LABEL} extraParams={{ suffix }} />
        <AFField
          fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_STATUS}`} parent={funding}
          className={styles.header_small_item} showLabel={false} type={Types.LABEL} extraParams={{ suffix }} />
        <AFField
          fieldPath={`${AC.FUNDINGS}~${AC.MODE_OF_PAYMENT}`} parent={funding}
          className={styles.header_small_item} showLabel={false} type={Types.LABEL} extraParams={{ suffix }} />
        <div className={styles.header_small_item}>
          <a
            onClick={this._removeFundingItem.bind(this, funding[AC.GROUP_VERSIONED_FUNDING], orgTypeName)}
            className={styles.delete} href={null} />
        </div>
      </div>
    </div>);
  }

  _refreshAfterChildChanges(errors) {
    if (errors !== this.state.showingErrors) {
      this.setState({ showingErrors: errors });
      this.props.refreshAfterChildChanges(errors, this.props.tabIndex);
    }
  }

  _findFundingById(id) {
    const { activity } = this.context;
    return activity[AC.FUNDINGS].find(f => f[AC.GROUP_VERSIONED_FUNDING] === id);
  }

  /**
   * Here we render a container with amp_funding table info but filtered by some donor and role
   * (2 params received from AFFunding).
   * @returns {*}
   */
  render() {
    // Filter only the fundings for this organization and role.
    return (<div className={styles.container}>
      {this._filterFundings(this.state.fundingList).map((g, i) => (
        <Panel
          header={this._generateComplexHeader(i, g)}
          key={Math.random()} collapsible
          expanded={g.open !== undefined ? g.open : true}
          onSelect={() => {
            // Look for amp_funding and update "open".
            const funding = this._findFundingById(g[AC.GROUP_VERSIONED_FUNDING]);
            if (funding) {
              funding.open = (funding.open !== undefined ? !funding.open : false);
              this.setState({ refresh: Math.random() });
            }
          }}>
          <AFFundingContainer
            funding={g} hasErrors={this.props.hasErrors}
            refreshAfterChildChanges={this._refreshAfterChildChanges} />
        </Panel>
      ))}
      <Button bsStyle="primary" onClick={this._addNewFundingItem}>{translate('New Funding Item')}</Button>
    </div>);
  }
}
