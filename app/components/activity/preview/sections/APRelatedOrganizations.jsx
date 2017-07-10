import React, { Component, PropTypes } from 'react';
import Section from './Section';
import {
  EXECUTING_AGENCY,
  CONTRACTING_AGENCY,
  BENEFICIARY_AGENCY,
  IMPLEMENTING_AGENCY,
  RESPONSIBLE_ORGANIZATION,
  AMP_ORGANIZATION_ROLE_ID
} from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';
import styles from './APRelatedOrganizations.css';
import APLabel from '../components/APLabel';

/**
 * @author Gabriel Inchauspe
 */
class APRelatedOrganizations extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.orgTypes = [RESPONSIBLE_ORGANIZATION,
      CONTRACTING_AGENCY,
      BENEFICIARY_AGENCY,
      IMPLEMENTING_AGENCY,
      EXECUTING_AGENCY];
  }

  _build() {
    // TODO: translate the organization type (AMPOFFLINE-477).
    const content = [];
    this.orgTypes.forEach(orgType => {
      if (this.props.activity[orgType] && this.props.activity[orgType].length > 0) {
        const subcontent = [];
        subcontent.push(<APLabel label={orgType} key={orgType} labelClass={styles.organization_title} />);
        this.props.activity[orgType].forEach(org => {
          subcontent.push(<APLabel
            label={org.organization.value}
            labelClass={styles.organization}
            key={org[AMP_ORGANIZATION_ROLE_ID]}
            />);
        });
        content.push(<div className={styles.organization_box}>{subcontent}</div>);
      }
    });
    return content;
  }

  render() {
    return (<div className={styles.organization_container}>
      {this._build()}
    </div>);
  }
}

export default Section(APRelatedOrganizations, 'Related Organizations');
