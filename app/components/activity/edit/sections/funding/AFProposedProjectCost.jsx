import React, { Component, PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import { createFormattedDate } from '../../../../../utils/DateUtils';

export default class AFProposedProjectCost extends Component {

  static propTypes = {
    activity: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  getCurrencyCodeSelector(cell) {
    // TODO: return the list from possible value 'ppc_amount~currency_code' in a combo.
    return `<span>${cell.value}</span>`;
  }

  getDate(cell) {
    return createFormattedDate(cell);
  }

  render() {
    if (this.props.activity[AC.PPC_AMOUNT]) {
      const columns = [<TableHeaderColumn dataField={AC.FUNDING_AMOUNT_ID} isKey hidden />];
      // TODO: check FM.
      if (true) {
        columns.push(<TableHeaderColumn dataField={AC.AMOUNT}>{translate('Amount')}</TableHeaderColumn>);
      }
      if (true) {
        columns.push(<TableHeaderColumn
          dataField={[AC.CURRENCY_CODE]}
          dataFormat={this.getCurrencyCodeSelector}>{translate('Currency')}</TableHeaderColumn>);
      }
      if (true) {
        columns.push(<TableHeaderColumn
          dataField={AC.FUNDING_DATE}
          dataFormat={this.getDate}>{translate('Date')}</TableHeaderColumn>);
      }
      return (<BootstrapTable
        data={this.props.activity[AC.PPC_AMOUNT]} bordered={false} striped hover>
        {columns}
      </BootstrapTable>);
    }
    return null;
  }
}
