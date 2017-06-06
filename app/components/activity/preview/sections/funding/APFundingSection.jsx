import React, { Component, PropTypes } from 'react';
import Section from '../Section';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import APFundingOrganizationSection from './APFundingOrganizationSection';
import APFundingTotalsSection from './APFundingTotalsSection';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import styles from './APFundingSection.css';

/**
 * Total Number of Fundings section
 * @author Gabriel Inchauspe
 */
class APFundingSection extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
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
        f1String += 'a';
        break;
      case VC.ACTUAL:
        f1String += 'b';
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
        f2String += 'a';
        break;
      case VC.ACTUAL:
        f2String += 'b';
        break;
      default:
        f2String += 'c';
        break;
    }
    return f1String > f2String ? 1 : -1;
  }

  render() {
    LoggerManager.log('render');
    const fundingList = [];
    this.props.activity.fundings.forEach((funding) => {
      const item = (<APFundingOrganizationSection
        funding={funding} key={funding[AC.AMP_FUNDING_ID]}
        comparator={this._compareFundings} />);
      fundingList.push(item);
    });
    return (<div className={styles.container}>
      <div>{fundingList}</div>
      <div><APFundingTotalsSection fundings={this.props.activity.fundings} comparator={this._compareFundings} /></div>
      <div className={styles.clear} />
    </div>);
  }
}

export default Section(APFundingSection, 'Funding');
