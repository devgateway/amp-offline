import React, { Component, PropTypes } from 'react';
import Section from './Section';
import {
  EXECUTING_AGENCY,
  CONTRACTING_AGENCY,
  BENEFICIARY_AGENCY,
  IMPLEMENTING_AGENCY,
  RESPONSIBLE_ORGANIZATION
} from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';
import styles from './APRelatedOrganizations.css';

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
    const content = [<br />];
    this.orgTypes.forEach(orgType => {
      if (this.props.activity[orgType] && this.props.activity[orgType].length > 0) {
        content.push(<div>{orgType}</div>);
        this.props.activity[orgType].forEach(org => {
          content.push(<div className={styles.organization}>{org.organization.value}</div>);
        });
        content.push(<hr />);
      }
    });
    return content;
  }

  render() {
    return (<div>
      {this._build()}
    </div>);
  }
}

export default Section(APRelatedOrganizations, 'Related Organizations');
