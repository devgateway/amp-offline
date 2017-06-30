/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { FormGroup, Checkbox } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import translate from '../../../../../utils/translate';
import AFFundingClassificationPanel from './AFFundingClassificationPanel';
import AFFundingDetailContainer from './AFFundingDetailContainer';

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingContainer extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  static propTypes = {
    funding: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    // TODO: Implement 'MTEF Projections' table when available for sync.
    return (<div>
      <FormGroup>
        <Checkbox inline value={this.props.funding[AC.ACTIVE]}>{translate('Active')}</Checkbox>
        <Checkbox
          inline value={this.props.funding[AC.DELEGATED_COOPERATION]}>
          {translate('Delegated Cooperation')}
        </Checkbox>
        <Checkbox inline value={this.props.funding[AC.DELEGATED_PARTNER]}>{translate('Delegated Partner')}</Checkbox>
      </FormGroup>
      <AFFundingClassificationPanel funding={this.props.funding} />
      <AFFundingDetailContainer funding={this.props.funding} type={VC.COMMITMENTS} />
      <AFFundingDetailContainer funding={this.props.funding} type={VC.DISBURSEMENTS} />
      <AFFundingDetailContainer funding={this.props.funding} type={VC.EXPENDITURES} />
    </div>);
  }
}
