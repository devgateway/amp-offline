import React, { Component, PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import * as AF from '../../components/AFComponentTypes';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import NumberUtils from '../../../../../utils/NumberUtils';
import styles from '../../components/AFList.css';
import AFField from '../../components/AFField';

/**
 * @author Gabriel Inchauspe
 */
export default class AFOverallFundingTotals extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.options = {
      withoutNoDataText: true
    };
  }

  getCurrencyCodeSelector(cell) {
    // TODO: return the list from possible value 'ppc_amount~currency_code' in a combo.
    return (<span>{cell.value ? cell.value : cell}</span>);
  }

  getAmount(cell) {
    return (<span>{NumberUtils.rawNumberToFormattedString(cell)}</span>);
  }

  _compareFundings(f1, f2) {
    let f1String = '';
    let f2String = '';
    switch (f1.trnType.value) {
      case VC.COMMITMENTS:
        f1String += 'a';
        break;
      case VC.DISBURSEMENTS:
        f1String += 'b';
        break;
      default:
        f1String += 'c';
        break;
    }
    switch (f1.adjType.value) {
      case VC.PLANNED:
        f1String += 'b';
        break;
      case VC.ACTUAL:
        f1String += 'a';
        break;
      default:
        f1String += 'c';
        break;
    }
    switch (f2.trnType.value) {
      case VC.COMMITMENTS:
        f2String += 'a';
        break;
      case VC.DISBURSEMENTS:
        f2String += 'b';
        break;
      default:
        f2String += 'c';
        break;
    }
    switch (f2.adjType.value) {
      case VC.PLANNED:
        f2String += 'b';
        break;
      case VC.ACTUAL:
        f2String += 'a';
        break;
      default:
        f2String += 'c';
        break;
    }
    return f1String > f2String ? 1 : -1;
  }

  /* TODO: Once https://github.com/devgateway/amp-client/pull/151 is merged
   use _buildTotals() from APFundingTotalsSection.jsx */
  _buildGroups(fundings) {
    const groups = [];
    fundings.forEach((item) => {
      item[AC.FUNDING_DETAILS].forEach(item2 => {
        const auxFd = {
          adjType: item2[AC.ADJUSTMENT_TYPE],
          trnType: item2[AC.TRANSACTION_TYPE],
          key: item2.id,
          currency: item2[AC.CURRENCY], // TODO: do currency conversion.
          amount: item2[AC.TRANSACTION_AMOUNT]
        };
        const group = groups.find(o => o.adjType.id === auxFd.adjType.id && o.trnType.id === auxFd.trnType.id);
        if (!group) {
          groups.push(auxFd);
        } else {
          group.amount += auxFd.amount;
        }
      });
    });
    return groups;
  }

  render() {
    const data = [];
    const groups = this._buildGroups(this.props.activity.fundings);
    const columns = [<TableHeaderColumn dataField="key" isKey hidden />,
      <TableHeaderColumn dataField="type">{translate('Transaction')}</TableHeaderColumn>,
      <TableHeaderColumn dataField="amount">{translate('Amount')}</TableHeaderColumn>,
      <TableHeaderColumn dataField="currency">{translate('Currency')}</TableHeaderColumn>];
    groups.sort(this._compareFundings).forEach((item) => (
      data.push({
        key: item.key,
        currency: item.currency.value,
        amount: NumberUtils.rawNumberToFormattedString(item.amount),
        type: translate(`Total ${item.adjType.value} ${item.trnType.value}`)
      })
    ));
    return (<div>
      <span><label htmlFor="ovft_table">{translate('Overall Funding Totals')}</label></span>
      <BootstrapTable
        options={this.options} containerClass={styles.containerTable} tableHeaderClass={styles.header}
        thClassName={styles.thClassName} hover data={data}>
        {columns}
      </BootstrapTable>
    </div>);
  }
}
