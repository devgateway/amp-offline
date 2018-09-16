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

const logger = new Logger('AP Funding MTEF section');

class APFundingTransactionTypeItem extends Component {

  static contextTypes = {
    currentWorkspaceSettings: PropTypes.object.isRequired,
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager)
  };

  static propTypes = {
    funding: PropTypes.object.isRequired,
  };

  render() {
    logger.debug('render');
    const { funding } = this.props;
    const currency = this.context.currentWorkspaceSettings.currency.code;
    if (FeatureManager.isFMSettingEnabled(FMC.MTEF_PROJECTIONS)) {
      return (
        <div>
          <APLabel label={translate('MTEF Projections')} labelClass={styles.header} key={Math.random()} />
          <div>
            <APLabel
              label={translate('Subtotal MTEF Projections Pipeline')} labelClass={styles.funding_table}
              key={Math.random()} />
            {funding[AC.MTEF_PROJECTIONS].map(mtef => (
              <APFundingMTEFItem item={mtef} key={Utils.numberRandom()} wsCurrency={currency} />
            ))}
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

}

export default APFundingTransactionTypeItem;
