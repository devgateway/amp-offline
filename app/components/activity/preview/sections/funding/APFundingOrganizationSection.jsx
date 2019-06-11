import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Logger from '../../../../../modules/util/LoggerManager';
import CurrencyRatesManager from '../../../../../modules/util/CurrencyRatesManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import * as FPC from '../../../../../utils/constants/FieldPathConstants';
import Tablify from '../../components/Tablify';
import APFundingTransactionTypeItem from './APFundingTransactionTypeItem';
import styles from './APFundingOrganizationSection.css';
import APFundingTotalItem from './APFundingTotalItem';
import translate from '../../../../../utils/translate';
import APFundingMTEFSection from './APFundingMTEFSection';

const logger = new Logger('AP funding organization section');

/**
 * @author Gabriel Inchauspe
 */
class APFundingOrganizationSection extends Component {

  static propTypes = {
    funding: PropTypes.object.isRequired,
    buildSimpleField: PropTypes.func.isRequired
  };
  static contextTypes = {
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager),
    currentWorkspaceSettings: PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props);
    logger.debug('constructor');
    this._currency = context.currentWorkspaceSettings.currency.code;
  }

  _buildDonorInfo() {
    const content = [];
    const { buildSimpleField, funding } = this.props;
    content.push(buildSimpleField(`${[AC.FUNDINGS]}~${[AC.FUNDING_DONOR_ORG_ID]}`, true, null, false, funding));
    content.push(buildSimpleField(`${[AC.FUNDINGS]}~${[AC.SOURCE_ROLE]}`, true, null, false, funding));
    content.push(buildSimpleField(`${[AC.FUNDINGS]}~${[AC.TYPE_OF_ASSISTANCE]}`, true, null, false, funding));
    content.push(buildSimpleField(`${[AC.FUNDINGS]}~${[AC.FINANCING_INSTRUMENT]}`, true, null, false, funding));
    content.push(buildSimpleField(`${[AC.FUNDINGS]}~${[AC.FUNDING_STATUS]}`, true, null, false, funding));
    content.push(buildSimpleField(`${[AC.FUNDINGS]}~${[AC.MODE_OF_PAYMENT]}`, true, null, false, funding));
    content.push(buildSimpleField(`${[AC.FUNDINGS]}~${[AC.FUNDING_CLASSIFICATION_DATE]}`, true, null, false, funding));
    content.push(buildSimpleField(`${[AC.FUNDINGS]}~${[AC.FINANCING_ID]}`, true, null, false, funding));
    content.push(buildSimpleField(`${[AC.FUNDINGS]}~${[AC.AGREEMENT]}~${[AC.AGREEMENT_TITLE]}`,
      true, null, false, funding && funding[AC.AGREEMENT]));
    content.push(buildSimpleField(`${[AC.FUNDINGS]}~${[AC.AGREEMENT]}~${[AC.AGREEMENT_CODE]}`,
      true, null, false, funding && funding[AC.AGREEMENT]));

    const tableContent = Tablify.addRows(content, AC.ACTIVITY_FUNDING_COLS);
    return tableContent;
  }

  _buildFieldTable(field) {
    const content = [];
    const { buildSimpleField, funding } = this.props;
    content.push(buildSimpleField(field, true, null, false, funding));
    return Tablify.addRows(content, 1);
  }

  _buildMTEFDetailSection() {
    return <APFundingMTEFSection funding={this.props.funding} />;
  }

  _buildFundingDetailSection() {
    // Group the list of funding details by adjustment_type and transaction_type.
    const groups = [];
    FPC.FUNDING_TRANSACTION_TYPES.forEach(trnType => {
      const fds = this.props.funding[trnType];
      if (fds && fds.length) {
        const fdByAT = new Map();
        VC.ADJUSTMENT_TYPES_AP_ORDER.forEach(adjType => fdByAT.set(adjType, []));
        fds.forEach(it => {
          const items = fdByAT.get(it[AC.ADJUSTMENT_TYPE] && it[AC.ADJUSTMENT_TYPE].value);
          if (items) {
            items.push(it);
          }
        });
        VC.ADJUSTMENT_TYPES_AP_ORDER.forEach(adjType => {
          const items = fdByAT.get(adjType);
          if (items.length) {
            groups.push([trnType, items]);
          }
        });
      }
    });
    return groups.map(([trnType, group], idx) =>
      <APFundingTransactionTypeItem
        trnType={trnType} fundingDetails={group} key={idx} buildSimpleField={this.props.buildSimpleField} />
    );
  }

  _buildUndisbursedBalanceSection() {
    let totalActualDisbursements = 0;
    let totalActualCommitments = 0;
    const fd = this.props.funding;
    if (!fd || fd.length === 0) {
      // Dont show this section if there are no funding details.
      return null;
    }
    const fdActualCommitments = (fd[AC.COMMITMENTS] || []).filter(item =>
      item[AC.ADJUSTMENT_TYPE].value === VC.ACTUAL
    );
    totalActualCommitments = this.context.currencyRatesManager.convertFundingDetailsToCurrency(fdActualCommitments,
      this._currency);
    const fdActualDisbursements = (fd[AC.DISBURSEMENTS] || []).filter(item =>
      item[AC.ADJUSTMENT_TYPE].value === VC.ACTUAL
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
    logger.debug('render');
    return (<div>
      <div className={styles.section_header} />
      <table className={styles.two_box_table}>
        <tbody>{this._buildDonorInfo()}</tbody>
      </table>
      <table className={styles.two_box_table}>
        <tbody>{this._buildFieldTable(`${[AC.FUNDINGS]}~${[AC.DONOR_OBJECTIVE]}`)}</tbody>
      </table>
      <table className={styles.two_box_table}>
        <tbody>{this._buildFieldTable(`${[AC.FUNDINGS]}~${[AC.CONDITIONS]}`)}</tbody>
      </table>
      <div className={styles.funding_detail}>{this._buildMTEFDetailSection()}</div>
      <div className={styles.funding_detail}>{this._buildFundingDetailSection()}</div>
      <div>{this._buildUndisbursedBalanceSection()}</div>
    </div>);
  }
}

export default APFundingOrganizationSection;
