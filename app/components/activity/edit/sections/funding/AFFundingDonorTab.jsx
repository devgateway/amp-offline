/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { Panel } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import translate from '../../../../../utils/translate';
import AFFundingContainer from './AFFundingContainer';

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingDonorTab extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  static propTypes = {
    fundings: PropTypes.array.isRequired,
    organization: PropTypes.object.isRequired,
    role: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    const ids = [];
    this._filterFundings(this.props.fundings).map(() => (ids.push(false)));
    this.state = {
      openFDT: ids
    };
  }

  _filterFundings(fundings) {
    return fundings.filter(f => (f[AC.FUNDING_DONOR_ORG_ID].id === this.props.organization.id
    && f[AC.SOURCE_ROLE].id === this.props.role.id));
  }

  render() {
    // Filter only the fundings for this organization and role.
    return (<div>
      {this._filterFundings(this.props.fundings).map((g, i) => (
        <Panel
          header={`${translate('Funding Item')} ${i + 1}`}
          key={g[AC.GROUP_VERSIONED_FUNDING]} collapsible expanded={this.state.openFDT[i]}
          onSelect={() => {
            const newOpenState = this.state.openFDT;
            newOpenState[i] = !newOpenState[i];
            this.setState({ openFDT: newOpenState });
          }}>
          <AFFundingContainer funding={g} />
        </Panel>
      ))}
    </div>);
  }
}
