/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import Section from '../Section';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import { APProposedProjectCost, APRevisedProjectCost } from '../APProjectCost';
import APFundingOrganizationSection from './APFundingOrganizationSection';
import APFundingTotalsSection from './APFundingTotalsSection';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import fundingStyles from './APFundingSection.css';
import * as VC from '../../../../../utils/constants/ValueConstants';
import { getAmountsInThousandsMessage } from '../../../../../utils/NumberUtils';
import ActivityFundingTotals from '../../../../../modules/activity/ActivityFundingTotals';

/**
 * Total Number of Fundings section
 * @author Gabriel Inchauspe
 */
class APFundingSection extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired,
    buildSimpleField: PropTypes.func.isRequired
  };

  static contextTypes = {
    activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals).isRequired
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
    LoggerManager.debug('render');
    const fundingList = [];
    let counter = 1;
    this.props.activity.fundings.forEach((funding) => {
      const item = (<APFundingOrganizationSection
        funding={funding} key={funding[AC.AMP_FUNDING_ID]}
        counter={counter} comparator={this._compareFundings}
        buildSimpleField={this.props.buildSimpleField} />);
      fundingList.push(item);
      counter += 1;
    });
    return (<div className={fundingStyles.container}>
      <div className={fundingStyles.byline}>{getAmountsInThousandsMessage()}</div>
      <APProposedProjectCost sectionPath={AC.PPC_AMOUNT} titleClass={fundingStyles.section_header} />
      <APRevisedProjectCost sectionPath={AC.RPC_AMOUNT} />
      <div>{fundingList}</div>
      <div><APFundingTotalsSection fundings={this.props.activity.fundings} comparator={this._compareFundings} /></div>
      <div className={fundingStyles.clear} />
    </div>);
  }
}

export default Section(APFundingSection, 'Funding', true, 'APFunding');
