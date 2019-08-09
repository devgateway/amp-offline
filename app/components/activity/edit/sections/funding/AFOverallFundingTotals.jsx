/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { ActivityConstants, ValueConstants } from 'amp-ui';
import * as FPC from '../../../../../utils/constants/FieldPathConstants';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import NumberUtils from '../../../../../utils/NumberUtils';
import styles from '../../components/AFList.css';
import CurrencyRatesManager from '../../../../../modules/util/CurrencyRatesManager';

const logger = new Logger('AF overall funding totals');

/**
 * @author Gabriel Inchauspe
 */
export default class AFOverallFundingTotals extends Component {

  static contextTypes = {
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager).isRequired,
    currentWorkspaceSettings: PropTypes.object.isRequired
  };

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.options = {
      withoutNoDataText: true
    };
  }

  _compareFundings(f1, f2) {
    let f1String = '';
    let f2String = '';
    switch (f1.trnType) {
      case ActivityConstants.COMMITMENTS:
        f1String += 'a';
        break;
      case ActivityConstants.DISBURSEMENTS:
        f1String += 'b';
        break;
      default:
        f1String += 'c';
        break;
    }
    switch (f1.adjType.value) {
      case ValueConstants.PLANNED:
        f1String += 'b';
        break;
      case ValueConstants.ACTUAL:
        f1String += 'a';
        break;
      default:
        f1String += 'c';
        break;
    }
    switch (f2.trnType) {
      case ActivityConstants.COMMITMENTS:
        f2String += 'a';
        break;
      case ActivityConstants.DISBURSEMENTS:
        f2String += 'b';
        break;
      default:
        f2String += 'c';
        break;
    }
    switch (f2.adjType.value) {
      case ValueConstants.PLANNED:
        f2String += 'b';
        break;
      case ValueConstants.ACTUAL:
        f2String += 'a';
        break;
      default:
        f2String += 'c';
        break;
    }
    return f1String > f2String ? 1 : -1;
  }

  _buildGroups(fundings) {
    const groups = [];
    if (fundings) {
      fundings.forEach((item) => {
        FPC.TRANSACTION_TYPES.forEach(trnType => {
          const details = item[trnType] || [];
          details.forEach(item2 => {
            if (item2[ActivityConstants.ADJUSTMENT_TYPE]) {
              const amount = this.context.currencyRatesManager
                .convertTransactionAmountToCurrency(item2, this.context.currentWorkspaceSettings.currency.code);
              const auxFd = {
                adjType: item2[ActivityConstants.ADJUSTMENT_TYPE],
                trnType,
                key: item2.id,
                currency: this.context.currentWorkspaceSettings.currency.code,
                amount
              };
              const group = groups.find(o => o.adjType.id === auxFd.adjType.id && o.trnType === auxFd.trnType);
              if (!group) {
                groups.push(auxFd);
              } else {
                group.amount += auxFd.amount;
              }
            }
          });
        });
      });
    }
    return groups;
  }

  render() {
    const data = [];
    const groups = this._buildGroups(this.props.activity.fundings);
    const columns = [<TableHeaderColumn dataField="key" isKey hidden key={0} />,
      <TableHeaderColumn
        dataField={ActivityConstants.TYPE} key={ActivityConstants.TYPE}>{translate('Transaction')}</TableHeaderColumn>,
      <TableHeaderColumn
        dataField={ActivityConstants.AMOUNT} key={ActivityConstants.AMOUNT}>{translate('Amount')}</TableHeaderColumn>,
      <TableHeaderColumn
        dataField={ActivityConstants.CURRENCY}
        key={ActivityConstants.CURRENCY}>{translate('Currency')}</TableHeaderColumn>];
    groups.sort(this._compareFundings).forEach((item) => (
      data.push({
        key: item.key,
        currency: item.currency,
        amount: NumberUtils.rawNumberToFormattedString(item.amount),
        type: translate(`Total ${item.adjType.value} ${item.trnType}`)
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
