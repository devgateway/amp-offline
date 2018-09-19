import React, { Component, PropTypes } from 'react';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import APLabel from '../../components/APLabel';
import FeatureManager from '../../../../../modules/util/FeatureManager';
import * as FMC from '../../../../../utils/constants/FeatureManagerConstants';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import styles from './APFundingTransactionTypeItem.css';
import stylesMTEF from './APFundingMTEF.css';
import APFundingMTEFItem from './APFundingMTEFItem';
import Utils from '../../../../../utils/Utils';
import CurrencyRatesManager from '../../../../../modules/util/CurrencyRatesManager';
import APFundingTotalItem from './APFundingTotalItem';

const logger = new Logger('AP Funding MTEF section');

class APFundingMTEFSection extends Component {

  static contextTypes = {
    currentWorkspaceSettings: PropTypes.object.isRequired,
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager)
  };

  static propTypes = {
    funding: PropTypes.object.isRequired,
  };

  static drawTable(mtef, currency) {
    return (<table className={styles.funding_table}>
      {<APFundingMTEFItem item={mtef} key={Utils.numberRandom()} wsCurrency={currency} />}
    </table>);
  }

  drawSubTotal(funding, currency, type) {
    let subtotal = 0;
    funding[AC.MTEF_PROJECTIONS].forEach(mtef => {
      if (mtef[AC.PROJECTION].value === type) {
        subtotal += this.context.currencyRatesManager.convertAmountToCurrency(mtef[AC.AMOUNT],
          mtef[AC.CURRENCY].value, mtef[AC.PROJECTION_DATE], null, currency);
      }
    });
    return (<div>
      <APFundingTotalItem
        value={subtotal}
        label={`${translate(`Subtotal MTEF Projections ${type}`)}`.toUpperCase()}
        currency={currency}
        key={Math.random()} />
    </div>);
  }

  render() {
    logger.debug('render');
    const { funding } = this.props;
    const types = [AC.PIPELINE, AC.PROJECTION];
    const currency = this.context.currentWorkspaceSettings.currency.code;
    if (FeatureManager.isFMSettingEnabled(FMC.MTEF_PROJECTIONS)
      && funding[AC.MTEF_PROJECTIONS] && funding[AC.MTEF_PROJECTIONS].length > 0) {
      const content = [];
      types.forEach(type => {
        let show = false;
        funding[AC.MTEF_PROJECTIONS].forEach(mtef => {
          if (mtef[AC.PROJECTION].value === type) {
            show = true;
            content.push(<div>
              {APFundingMTEFSection.drawTable(mtef, currency)}
            </div>);
          }
        });
        if (show) {
          content.push(this.drawSubTotal(funding, currency, type));
        }
      });
      return (<div>
        <div className={stylesMTEF.header}>
          <APLabel label={translate('MTEF Projections')} labelClass={styles.header} key={Math.random()} />
        </div>
        {content}
      </div>);
    } else {
      return null;
    }
  }

}

export default APFundingMTEFSection;
