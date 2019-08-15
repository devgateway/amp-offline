import React, { Component, PropTypes } from 'react';
import { ActivityConstants, FeatureManagerConstants, CurrencyRatesManager, FeatureManager, APLabel,
  UIUtils } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import styles from './APFundingTransactionTypeItem.css';
import stylesMTEF from './APFundingMTEF.css';
import APFundingMTEFItem from './APFundingMTEFItem';
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
      {<APFundingMTEFItem item={mtef} key={UIUtils.numberRandom()} wsCurrency={currency} />}
    </table>);
  }

  drawSubTotal(funding, currency, type) {
    let subtotal = 0;
    funding[ActivityConstants.MTEF_PROJECTIONS].forEach(mtef => {
      if (mtef[ActivityConstants.PROJECTION].value === type) {
        subtotal += this.context.currencyRatesManager.convertAmountToCurrency(mtef[ActivityConstants.AMOUNT],
          mtef[ActivityConstants.CURRENCY].value, mtef[ActivityConstants.PROJECTION_DATE], null, currency);
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
    const types = [ActivityConstants.PIPELINE, ActivityConstants.PROJECTION];
    const currency = this.context.currentWorkspaceSettings.currency.code;
    if (FeatureManager.isFMSettingEnabled(FeatureManagerConstants.MTEF_PROJECTIONS)
      && funding[ActivityConstants.MTEF_PROJECTIONS] && funding[ActivityConstants.MTEF_PROJECTIONS].length > 0) {
      const content = [];
      types.forEach(type => {
        let show = false;
        funding[ActivityConstants.MTEF_PROJECTIONS].forEach(mtef => {
          if (mtef[ActivityConstants.PROJECTION].value === type) {
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
          <APLabel
            label={translate('MTEF Projections')} labelClass={styles.header} key={Math.random()}
            translate={translate} Logger={Logger} />
        </div>
        {content}
      </div>);
    } else {
      return null;
    }
  }

}

export default APFundingMTEFSection;
