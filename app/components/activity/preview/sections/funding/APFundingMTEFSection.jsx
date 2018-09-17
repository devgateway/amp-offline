import React, { Component, PropTypes } from 'react';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import APLabel from '../../components/APLabel';
import FeatureManager from '../../../../../modules/util/FeatureManager';
import * as FMC from '../../../../../utils/constants/FeatureManagerConstants';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import styles from './APFundingTransactionTypeItem.css';
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

  static drawTable(funding, currency) {
    const content = [];
    funding[AC.MTEF_PROJECTIONS].forEach((mtef) => {
      content.push(<APFundingMTEFItem item={mtef} key={Utils.numberRandom()} wsCurrency={currency} />);
    });
    return <table className={styles.funding_table}>{content}</table>;
  }

  drawSubTotal(funding, currency) {
    let subtotal = 0;
    funding[AC.MTEF_PROJECTIONS].forEach(mtef => {
      subtotal += this.context.currencyRatesManager.convertAmountToCurrency(mtef[AC.AMOUNT],
        mtef[AC.CURRENCY].value, mtef[AC.PROJECTION_DATE], null, currency);
    });
    return (<div>
      <APFundingTotalItem
        value={subtotal}
        label={`${translate('Subtotal MTEF Projections Projection')}`.toUpperCase()}
        currency={currency}
        key={Math.random()} />
    </div>);
  }

  render() {
    logger.debug('render');
    const { funding } = this.props;
    const currency = this.context.currentWorkspaceSettings.currency.code;
    if (FeatureManager.isFMSettingEnabled(FMC.MTEF_PROJECTIONS)
      && funding[AC.MTEF_PROJECTIONS] && funding[AC.MTEF_PROJECTIONS].length > 0) {
      return (
        <div>
          <div style={{ marginTop: '10px' }}>
            <APLabel label={translate('MTEF Projections')} labelClass={styles.header} key={Math.random()} />
          </div>
          <APLabel
            label={translate('Subtotal MTEF Projections Pipeline').toUpperCase()} key={Math.random()}
            labelClass={styles.mtef_group} />
          {APFundingMTEFSection.drawTable(funding, currency)}
          {this.drawSubTotal(funding, currency)}
        </div>
      );
    } else {
      return null;
    }
  }

}

export default APFundingMTEFSection;
