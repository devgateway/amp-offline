import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import APField from '../../components/APField';
import APFundingTransactionTypeItem from './APFundingTransactionTypeItem';
import styles from './APFundingOrganizationSection.css';

/**
 * @author Gabriel Inchauspe
 */
class APFundingOrganizationSection extends Component {

  static propTypes = {
    funding: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  _buildDonorInfo() {
    const content = [];
    content.push(APField.instance('Organization Name', this.props.funding[AC.FUNDING_DONOR_ORG_ID].value, true, false));
    content.push(APField.instance('Organization Role', this.props.funding[AC.SOURCE_ROLE].value, true, false));
    content.push(APField.instance('Type of Assistance', this.props.funding[AC.TYPE_OF_ASSISTANCE].value, true, false));
    content.push(APField.instance('Financing Instrument',
      this.props.funding[AC.FINANCING_INSTRUMENT].value, true, false));
    content.push(APField.instance('Funding Status', this.props.funding[AC.FUNDING_STATUS].value, true, false));
    // TODO: Add 'agreement title' and 'agreement code' fields.
    return content;
  }

  _buildFundingDetailSection() {
    const content = [];
    // Group the list of funding details by adjustment_type and transaction_type.
    const fd = this.props.funding[AC.FUNDING_DETAILS];
    const groups = [];
    fd.forEach((item) => {
      const auxFd = {
        adjType: item[AC.ADJUSTMENT_TYPE],
        trnType: item[AC.TRANSACTION_TYPE],
        key: item.id,
        currency: item[AC.CURRENCY]
      };
      if (!groups.find(o => o.adjType.id === auxFd.adjType.id && o.trnType.id === auxFd.trnType.id)) {
        groups.push(auxFd);
      }
    });
    // TODO: Sort the groups.
    groups.forEach((group) => {
      content.push(<APFundingTransactionTypeItem fundingDetails={fd} group={group} key={group.key} />);
    });
    return content;
  }

  render() {
    LoggerManager.log('render');
    return (<div>
      <div>{this._buildDonorInfo()}</div>
      <div className={styles.container}>{this._buildFundingDetailSection()}</div>
      <div className={styles.hr}>
        <hr />
      </div>
    </div>);
  }
}

export default APFundingOrganizationSection;
