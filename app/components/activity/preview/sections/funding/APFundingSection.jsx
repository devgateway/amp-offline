/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants, Section } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import { APProposedProjectCost } from '../APProjectCost';
import APFundingOrganizationSection from './APFundingOrganizationSection';
import APFundingTotalsSection from './APFundingTotalsSection';
import fundingStyles from './APFundingSection.css';
import { getAmountsInThousandsMessage } from '../../../../../utils/NumberUtils';
import * as Utils from '../../../../../utils/Utils';
import translate from '../../../../../utils/translate';
import DateUtils from '../../../../../utils/DateUtils';

const logger = new Logger('AP funding section');

/**
 * Total Number of Fundings section
 * @author Gabriel Inchauspe
 */
class APFundingSection extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired,
    buildSimpleField: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
  }

  render() {
    logger.debug('render');
    const fundingList = [];
    if (this.props.activity.fundings) {
      this.props.activity.fundings.forEach((funding) => {
        const item = (<APFundingOrganizationSection
          funding={funding} key={funding[ActivityConstants.AMP_FUNDING_ID] || Utils.stringToUniqueId()}
          buildSimpleField={this.props.buildSimpleField} />);
        fundingList.push(item);
      });
    }
    return (<div className={fundingStyles.container}>
      <div className={fundingStyles.byline}>{getAmountsInThousandsMessage()}</div>
      <APProposedProjectCost sectionPath={ActivityConstants.PPC_AMOUNT} titleClass={fundingStyles.section_header} />
      <div>{fundingList}</div>
      <div><APFundingTotalsSection /></div>
      <div className={fundingStyles.clear} />
    </div>);
  }
}
export default Section(APFundingSection, { SectionTitle: 'Funding',
  useEncapsulateHeader: true,
  sID: 'APFunding',
  Logger,
  translate,
  DateUtils,
  Utils
});
