/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { Panel } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import translate from '../../../../../utils/translate';
import AFFundingContainer from './AFFundingContainer';
import AFField from '../../components/AFField';
import styles from './AFFundingDonorSection.css';
import * as Types from '../../components/AFComponentTypes';

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingDonorSection extends Component {

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
    // We manage the open/close state of these panels or they will have problems when nested panels.
    const openFundingsState = [];
    this._filterFundings(this.props.fundings).map(() => (openFundingsState.push(false)));
    this.state = {
      openFundingDonorSection: openFundingsState
    };
  }

  _filterFundings(fundings) {
    return fundings.filter(f => (f[AC.FUNDING_DONOR_ORG_ID].id === this.props.organization.id
    && f[AC.SOURCE_ROLE].id === this.props.role.id));
  }

  _generateComplexHeader(i, funding) {
    // TODO: AFFields objects are refreshed.
    return (<div>
      <div>{`${translate('Funding Item')} ${i + 1}`}</div>
      <div className={styles.header} >
        <AFField
          fieldPath={`${AC.FUNDINGS}~${AC.TYPE_OF_ASSISTANCE}`} parent={funding}
          className={styles.header_small_item} showLabel={false} type={Types.LABEL} /> |
        <AFField
          fieldPath={`${AC.FUNDINGS}~${AC.FINANCING_INSTRUMENT}`} parent={funding}
          className={styles.header_small_item} showLabel={false} type={Types.LABEL} /> |
        <AFField
          fieldPath={`${AC.FUNDINGS}~${AC.FINANCING_ID}`} parent={funding}
          className={styles.header_small_item} showLabel={false} type={Types.LABEL} /> |
        <AFField
          fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_STATUS}`} parent={funding}
          className={styles.header_small_item} showLabel={false} type={Types.LABEL} /> |
        <AFField
          fieldPath={`${AC.FUNDINGS}~${AC.MODE_OF_PAYMENT}`} parent={funding}
          className={styles.header_small_item} showLabel={false} type={Types.LABEL} />
        {/* <Button bsSize="xsmall" bsStyle="danger"><Glyphicon glyph="glyphicon glyphicon-remove" /></Button> */}
      </div>
    </div>);
  }

  render() {
    // Filter only the fundings for this organization and role.
    return (<div className={styles.container} >
      {this._filterFundings(this.props.fundings).map((g, i) => (
        <Panel
          header={this._generateComplexHeader(i, g)}
          key={g[AC.GROUP_VERSIONED_FUNDING]} collapsible expanded={this.state.openFundingDonorSection[i]}
          onSelect={() => {
            const newOpenState = this.state.openFundingDonorSection;
            newOpenState[i] = !newOpenState[i];
            this.setState({ openFundingDonorSection: newOpenState });
          }} >
          <AFFundingContainer funding={g} />
        </Panel>
      ))}
    </div>);
  }
}