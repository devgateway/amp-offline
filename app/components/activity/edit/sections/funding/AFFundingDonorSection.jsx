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
    activity: PropTypes.object.isRequired
  };

  static propTypes = {
    fundings: PropTypes.array.isRequired,
    organization: PropTypes.object.isRequired,
    role: PropTypes.object.isRequired,
    removeFundingItem: PropTypes.func.isRequired,
    addFundingItem: PropTypes.func.isRequired,
    hasErrors: PropTypes.func.isRequired
  };

  constructor(props, context) {
    super(props, context);
    logger.log('constructor');
    // We manage the open/close state of these panels or they will have problems when nested panels.
    const openFundingsState = [];
    const filteredFundings = this._filterFundings(this.props.fundings);
    filteredFundings.map((f) => (openFundingsState.push({
      open: false,
      id: f[AC.GROUP_VERSIONED_FUNDING]
    })));
    this.state = {
      openFundingDonorSection: openFundingsState,
      fundingList: filteredFundings
    };
    this._addNewFundingItem = this._addNewFundingItem.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // Expand the section that has errors.
    const openFundingDonorSectionState = this.state.openFundingDonorSection;
    nextProps.fundings.forEach(f => {
      if (this.props.hasErrors(f) || this.props.hasErrors(f[AC.FUNDING_DETAILS])) {
        const section = openFundingDonorSectionState.find(t => t.id === f[AC.GROUP_VERSIONED_FUNDING]);
        if (section) {
          section.open = true;
        }
      }
    });
    this.setState({
      openFundingDonorSection: openFundingDonorSectionState,
      fundingList: this._filterFundings(nextProps.fundings)
    });
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
    const newFundingList = this.state.fundingList.slice();
    newFundingList.push(fundingItem);
    const newOpenFundingDonorSection = this.state.openFundingDonorSection;
    newOpenFundingDonorSection.push({ open: false, id: fundingItem[AC.GROUP_VERSIONED_FUNDING] });
    this.setState({ fundingList: newFundingList, openFundingDonorSection: newOpenFundingDonorSection });

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
    return (<div
      className={(this.props.hasErrors(funding) || this.props.hasErrors(funding[AC.FUNDING_DETAILS]))
        ? fundingStyles.error : ''}>
      <div>{`${translate('Funding Item')} ${i + 1}`}</div>
      <div className={styles.header}>
        <AFField
          fieldPath={`${AC.FUNDINGS}~${AC.TYPE_OF_ASSISTANCE}`} parent={funding}
          className={styles.header_small_item} showLabel={false} type={Types.LABEL} showRequired={false} />
        <AFField
          fieldPath={`${AC.FUNDINGS}~${AC.FINANCING_INSTRUMENT}`} parent={funding}
          className={styles.header_small_item} showLabel={false} type={Types.LABEL} showRequired={false} />
        <AFField
          fieldPath={`${AC.FUNDINGS}~${AC.FINANCING_ID}`} parent={funding}
          className={styles.header_small_item} showLabel={false} type={Types.LABEL} />
        <AFField
          fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_STATUS}`} parent={funding}
          className={styles.header_small_item} showLabel={false} type={Types.LABEL} />
        <AFField
          fieldPath={`${AC.FUNDINGS}~${AC.MODE_OF_PAYMENT}`} parent={funding}
          className={styles.header_small_item} showLabel={false} type={Types.LABEL} />
        <div className={styles.header_small_item}>
          <a
            onClick={this._removeFundingItem.bind(this, funding[AC.GROUP_VERSIONED_FUNDING], orgTypeName)}
            className={styles.delete} href={null} />
        </div>
      </div>
    </div>);
  }

  render() {
    // Filter only the fundings for this organization and role.
    return (<div className={styles.container}>
      {this._filterFundings(this.state.fundingList).map((g, i) => (
        <Panel
          header={this._generateComplexHeader(i, g)}
          key={Math.random()} collapsible
          expanded={this.state.openFundingDonorSection[i] ? this.state.openFundingDonorSection[i].open : false}
          onSelect={() => {
            const newOpenState = this.state.openFundingDonorSection;
            newOpenState[i].open = !newOpenState[i].open;
            this.setState({ openFundingDonorSection: newOpenState });
          }}>
          <AFFundingContainer funding={g} hasErrors={this.props.hasErrors} />
        </Panel>
      ))}
      <Button bsStyle="primary" onClick={this._addNewFundingItem}>{translate('New Funding Item')}</Button>
    </div>);
  }
}
