import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import CurrencyRatesManager from '../../../../../modules/util/CurrencyRatesManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import Tablify from '../../components/Tablify';
import APFundingTransactionTypeItem from './APFundingTransactionTypeItem';
import styles from './APFundingOrganizationSection.css';
import APFundingTotalItem from './APFundingTotalItem';
import translate from '../../../../../utils/translate';

/**
 * @author Gabriel Inchauspe
 */
class APFundingOrganizationSection extends Component {

  static propTypes = {
    funding: PropTypes.object.isRequired,
    counter: PropTypes.number.isRequired,
    comparator: PropTypes.func.isRequired,
    buildSimpleField: PropTypes.func.isRequired
  };
  static contextTypes = {
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager),
    currentWorkspaceSettings: PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props);
    LoggerManager.log('constructor');
    this._currency = context.currentWorkspaceSettings.currency;
  }

  _buildDonorInfo() {
    const content = [];
    const { buildSimpleField, funding } = this.props;
    content.push(buildSimpleField(`${AC.FUNDINGS}~${AC.FUNDING_DONOR_ORG_ID}`, true, null, true, funding));
    content.push(buildSimpleField(`${AC.FUNDINGS}~${AC.SOURCE_ROLE}`, true, null, true, funding));
    content.push(buildSimpleField(`${AC.FUNDINGS}~${AC.TYPE_OF_ASSISTANCE}`, true, null, true, funding));
    content.push(buildSimpleField(`${AC.FUNDINGS}~${AC.FINANCING_INSTRUMENT}`, true, null, true, funding));
    content.push(buildSimpleField(`${AC.FUNDINGS}~${AC.FUNDING_STATUS}`, true, null, true, funding));
    content.push(buildSimpleField(`${AC.FUNDINGS}~${AC.MODE_OF_PAYMENT}`, true, null, true, funding));
    content.push(buildSimpleField(`${AC.FUNDINGS}~${AC.FINANCING_INSTRUMENT}`, true, null, true, funding));
    content.push(buildSimpleField(`${AC.FUNDINGS}~${AC.FUNDING_CLASSIFICATION_DATE}`, true, null, true, funding));
    content.push(buildSimpleField(`${AC.FUNDINGS}~${AC.FINANCING_ID}`, true, null, true, funding));
    content.push(buildSimpleField(`${AC.FUNDINGS}~${AC.AGREEMENT}~${AC.AGREEMENT_TITLE}`,
      true, null, true, funding));
    content.push(buildSimpleField(`${AC.FUNDINGS}~${AC.AGREEMENT}~${AC.AGREEMENT_CODE}`,
      true, null, true, funding));

    const tableContent = Tablify.addRows(content, AC.ACTIVITY_FUNDING_COLS);
    return tableContent;
  }

  _buildFundingDetailSection() {
    const content = [];
    // Group the list of funding details by adjustment_type and transaction_type.
    const fd = this.props.funding[AC.FUNDING_DETAILS];
    const groups = [];
    fd.forEach((item) => {
      const auxFd = {
        adjType: item[AC.ADJUSTMENT_TYPE],
        trnType: item[AC.TRANSACTION_TYPE],
        key: item.id,
        currency: item[AC.CURRENCY]
      };
      if (!groups.find(o => o.adjType.id === auxFd.adjType.id && o.trnType.id === auxFd.trnType.id)) {
        groups.push(auxFd);
      }
    });
    const sortedGroups = groups.sort(this.props.comparator);
    sortedGroups.forEach((group) => {
      content.push(<APFundingTransactionTypeItem fundingDetails={fd} group={group} key={group.key} />);
    });
    return content;
  }

  _buildUndisbursedBalanceSection() {
    let totalActualDisbursements = 0;
    let totalActualCommitments = 0;
    const fd = this.props.funding[AC.FUNDING_DETAILS];
    const fdActualCommitments = fd.filter((item) =>
      item[AC.ADJUSTMENT_TYPE].value === VC.ACTUAL && item[AC.TRANSACTION_TYPE].value === VC.COMMITMENTS
    );
    totalActualCommitments = this.context.currencyRatesManager.convertFundingDetailsToCurrency(fdActualCommitments,
      this._currency);
    const fdActualDisbursements = fd.filter((item) =>
      item[AC.ADJUSTMENT_TYPE].value === VC.ACTUAL && item[AC.TRANSACTION_TYPE].value === VC.DISBURSEMENTS
    );
    totalActualDisbursements = this.context.currencyRatesManager.convertFundingDetailsToCurrency(fdActualDisbursements,
      this._currency);


    return (<div>
      <APFundingTotalItem
        label={translate('Undisbursed Balance')} value={totalActualCommitments - totalActualDisbursements}
        currency={translate(this._currency)} key={'undisbursed-balance-key'} />
    </div>);
  }

  render() {
    LoggerManager.log('render');
    return (<div>
      <div className={styles.section_header}> {translate('Funding Item')} {this.props.counter} </div>
      <table className={styles.two_box_table}>
        <tbody>{this._buildDonorInfo()}</tbody>
      </table>
      <div className={styles.funding_detail}>{this._buildFundingDetailSection()}</div>
      <div>{this._buildUndisbursedBalanceSection()}</div>
    </div>);
  }
}

export default APFundingOrganizationSection;
