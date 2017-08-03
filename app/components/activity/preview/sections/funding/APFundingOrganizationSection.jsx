import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import CurrencyRatesManager from '../../../../../modules/util/CurrencyRatesManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import APField from '../../components/APField';
import Tablify from '../../components/Tablify';
import APFundingTransactionTypeItem from './APFundingTransactionTypeItem';
import styles from './APFundingOrganizationSection.css';
import APFundingTotalItem from './APFundingTotalItem';
import translate from '../../../../../utils/translate';
import { createFormattedDate } from '../../../../../utils/DateUtils';

/**
 * @author Gabriel Inchauspe
 */
class APFundingOrganizationSection extends Component {

  static propTypes = {
    funding: PropTypes.object.isRequired,
    counter: PropTypes.number.isRequired,
    comparator: PropTypes.func.isRequired
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
    content.push(APField.instance('Organization Name', this.props.funding[AC.FUNDING_DONOR_ORG_ID].value, false, false,
      styles.funding_field_name, styles.funding_field_value));
    content.push(APField.instance('Organization Role', this.props.funding[AC.SOURCE_ROLE].value, false, false,
      styles.funding_field_name, styles.funding_field_value));
    content.push(APField.instance('Type of Assistance', this.props.funding[AC.TYPE_OF_ASSISTANCE]
      ? this.props.funding[AC.TYPE_OF_ASSISTANCE].value : '', false, false,
      styles.funding_field_name, styles.funding_field_value));
    content.push(APField.instance('Financing Instrument', this.props.funding[AC.FINANCING_INSTRUMENT]
      ? this.props.funding[AC.FINANCING_INSTRUMENT].value : '',
      false, false, styles.funding_field_name, styles.funding_field_value));
    const fundingStatus = this.props.funding[AC.FUNDING_STATUS] ? this.props.funding[AC.FUNDING_STATUS].value : '';
    content.push(APField.instance('Funding Status', fundingStatus, false, false,
      styles.funding_field_name, styles.funding_field_value));
    content.push(APField.instance('Mode of Payment',
      this.props.funding[AC.MODE_OF_PAYMENT] ? this.props.funding[AC.MODE_OF_PAYMENT].value : '', false, false,
      styles.funding_field_name, styles.funding_field_value));
    content.push(APField.instance('Agreement Title',
      this.props.funding[AC.AGREEMENT] ? this.props.funding[AC.AGREEMENT][AC.AGREEMENT_TITLE] : '', false, false,
      styles.funding_field_name, styles.funding_field_value));
    content.push(APField.instance('Agreement Code',
      this.props.funding[AC.AGREEMENT] ? this.props.funding[AC.AGREEMENT][AC.AGREEMENT_CODE] : '', false, false,
      styles.funding_field_name, styles.funding_field_value));
    content.push(APField.instance('Funding Classification Date',
      createFormattedDate(this.props.funding[AC.FUNDING_CLASSIFICATION_DATE]), false, false,
      styles.funding_field_name, styles.funding_field_value));
    content.push(APField.instance('Funding Organization Id',
      this.props.funding[AC.FINANCING_ID] ? this.props.funding[AC.FINANCING_ID] : '', false, false,
      styles.funding_field_name, styles.funding_field_value));

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
      <div className={styles.section_header} > {translate('Funding Item')} {this.props.counter} </div>
      <table className={styles.two_box_table} >
        <tbody>{this._buildDonorInfo()}</tbody>
      </table>
      <div className={styles.funding_detail} >{this._buildFundingDetailSection()}</div>
      <div>{this._buildUndisbursedBalanceSection()}</div>
    </div>);
  }
}

export default APFundingOrganizationSection;
