/* eslint-disable class-methods-use-this */
/* eslint-disable jsx-a11y/anchor-has-content */
import React, { Component, PropTypes } from 'react';
import { Button, Panel } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import Logger from '../../../../../modules/util/LoggerManager';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import translate from '../../../../../utils/translate';
import AFFundingContainer from './AFFundingContainer';
import AFField from '../../components/AFField';
import styles from './AFFundingDonorSection.css';
import * as Types from '../../components/AFComponentTypes';
import * as Utils from '../../../../../utils/Utils';

const logger = new Logger('AF funding donor section');

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingDonorSection extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  static propTypes = {
    fundings: PropTypes.array.isRequired,
    organization: PropTypes.object.isRequired,
    role: PropTypes.object.isRequired,
    removeFundingItem: PropTypes.func.isRequired
  };

  constructor(props, context) {
    super(props, context);
    logger.log('constructor');
    // We manage the open/close state of these panels or they will have problems when nested panels.
    const openFundingsState = [];
    this._filterFundings(this.props.fundings).map(() => (openFundingsState.push(false)));
    this.state = {
      openFundingDonorSection: openFundingsState,
      fundingList: this.props.fundings
    };
    this._addNewFundingItem = this._addNewFundingItem.bind(this);
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
    const newFundingList = this.state.fundingList;
    newFundingList.push(fundingItem);
    this.setState({ fundingList: newFundingList });
  }

  _filterFundings(fundings) {
    // If source_role is disabled then we filter only by organization.
    const filterSourceRole = this.context.activityFieldsManager.isFieldPathEnabled(`${AC.FUNDINGS}~${AC.SOURCE_ROLE}`);
    return fundings.filter(f => (f[AC.FUNDING_DONOR_ORG_ID].id === this.props.organization.id
      && (filterSourceRole ? f[AC.SOURCE_ROLE].id === this.props.role.id : true)));
  }

  _generateComplexHeader(i, funding) {
    // TODO: AFFields objects are not being refreshed (use a bind function?).
    return (<div>
      <div>{`${translate('Funding Item')} ${i + 1}`}</div>
      <div className={styles.header}>
        <AFField
          fieldPath={`${AC.FUNDINGS}~${AC.TYPE_OF_ASSISTANCE}`} parent={funding}
          className={styles.header_small_item} showLabel={false} type={Types.LABEL} />
        <AFField
          fieldPath={`${AC.FUNDINGS}~${AC.FINANCING_INSTRUMENT}`} parent={funding}
          className={styles.header_small_item} showLabel={false} type={Types.LABEL} />
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
            onClick={this.props.removeFundingItem.bind(this, funding[AC.GROUP_VERSIONED_FUNDING])}
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
          key={g[AC.GROUP_VERSIONED_FUNDING]} collapsible expanded={this.state.openFundingDonorSection[i]}
          onSelect={() => {
            const newOpenState = this.state.openFundingDonorSection;
            newOpenState[i] = !newOpenState[i];
            this.setState({ openFundingDonorSection: newOpenState });
          }}>
          <AFFundingContainer funding={g} />
        </Panel>
      ))}
      <Button bsStyle="primary" onClick={this._addNewFundingItem}>{translate('New Funding Item')}</Button>
    </div>);
  }
}
