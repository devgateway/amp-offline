import React, { Component, PropTypes } from 'react';
import Logger from '../../../../../modules/util/LoggerManager';
import CurrencyRatesManager from '../../../../../modules/util/CurrencyRatesManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import translate from '../../../../../utils/translate';
import { createFormattedDate } from '../../../../../utils/DateUtils';
import styles from './APFundingItem.css';
import { rawNumberToFormattedString } from '../../../../../utils/NumberUtils';
import * as FMC from '../../../../../utils/constants/FeatureManagerConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import FeatureManager from '../../../../../modules/util/FeatureManager';

const logger = new Logger('AP Funding item');

/**
 * @author Gabriel Inchauspe
 */
class APFundingItem extends Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    wsCurrency: PropTypes.string.isRequired
  };
  static contextTypes = {
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager)
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  insertPledgeRow() {
    let pledgeFMPath;
    switch (this.props.item[AC.TRANSACTION_TYPE].value) {
      case VC.COMMITMENTS:
        pledgeFMPath = FMC.ACTIVITY_COMMITMENTS_PLEDGES;
        break;
      case VC.DISBURSEMENTS:
        pledgeFMPath = FMC.ACTIVITY_DISBURSEMENTS_PLEDGES;
        break;
      case VC.EXPENDITURES:
        pledgeFMPath = FMC.ACTIVITY_EXPENDITURES_PLEDGES;
        break;
      default:
        break;
    }
    if (this.props.item.pledge && FeatureManager.isFMSettingEnabled(pledgeFMPath)) {
      return (<tr className={styles.row}>
        <td
          colSpan={AC.AP_FUNDINGS_TABLE_COLS}
          className={styles.left_text}>
          <span>{`${translate('Source Pledge')}: `}</span>
          <span className={styles.value}>{`${translate(this.props.item[AC.PLEDGE].value)}`}</span>
        </td>
      </tr>);
    } else {
      return null;
    }
  }

  insertFixedExchangeRateCell() {
    let exchangeRateFMPath;
    switch (this.props.item[AC.TRANSACTION_TYPE].value) {
      case VC.COMMITMENTS:
        exchangeRateFMPath = FMC.ACTIVITY_COMMITMENTS_FIXED_EXCHANGE_RATE;
        break;
      case VC.DISBURSEMENTS:
        exchangeRateFMPath = FMC.ACTIVITY_DISBURSEMENTS_FIXED_EXCHANGE_RATE;
        break;
      case VC.EXPENDITURES:
        exchangeRateFMPath = FMC.ACTIVITY_EXPENDITURES_FIXED_EXCHANGE_RATE;
        break;
      default:
        break;
    }
    if (FeatureManager.isFMSettingEnabled(exchangeRateFMPath)) {
      return this.props.item[AC.FIXED_EXCHANGE_RATE];
    } else {
      return null;
    }
  }

  render() {
    logger.log('render');
    const convertedAmount = this.context.currencyRatesManager.convertTransactionAmountToCurrency(this.props.item,
      this.props.wsCurrency);
    return (
      <tbody>
        <tr className={styles.row}>
          <td className={styles.left_text}>{translate(this.props.item[AC.ADJUSTMENT_TYPE].value)}</td>
          <td className={styles.right_text}>{createFormattedDate(this.props.item[AC.TRANSACTION_DATE])}</td>
          <td
            className={styles.right_text}>
            {`${rawNumberToFormattedString(convertedAmount)} ${this.props.wsCurrency}`}</td>
          <td className={[styles.right_text, styles.exchange_rate].join(' ')}>{this.insertFixedExchangeRateCell()}</td>
        </tr>
        {this.insertPledgeRow()}
      </tbody>);
  }
}

export default APFundingItem;
