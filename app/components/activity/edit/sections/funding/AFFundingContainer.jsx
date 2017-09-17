/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { FormGroup, Col, Grid, Row } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import AFFundingClassificationPanel from './AFFundingClassificationPanel';
import AFFundingDetailContainer from './AFFundingDetailContainer';
import AFField from '../../components/AFField';
import * as Types from '../../components/AFComponentTypes';

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
    LoggerManager.debug('constructor');
    this._removeFundingDetailItem = this._removeFundingDetailItem.bind(this);
    this.state = {
      stateFundingDetail: this.props.funding[AC.FUNDING_DETAILS]
    };
  }

  _removeFundingDetailItem(id) {
    LoggerManager.debug('_removeFundingDetailItem');
    // TODO: Display a confirm dialog to delete the funding item.
    const newFunding = this.state.stateFundingDetail;
    const index = this.state.stateFundingDetail.findIndex((item) => (item[AC.TEMPORAL_ID] === id));
    newFunding.splice(index, 1);
    this.setState({ stateFundingDetail: newFunding });
  }

  render() {
    // TODO: Implement 'MTEF Projections' table when available for sync.
    return (<div>
      <FormGroup>
        <Grid>
          <Row>
            <Col md={2} lg={2}>
              <AFField parent={this.props.funding} fieldPath={`${AC.FUNDINGS}~${AC.ACTIVE}`} type={Types.CHECKBOX} />
            </Col>
            <Col md={2} lg={2}>
              <AFField
                parent={this.props.funding} fieldPath={`${AC.FUNDINGS}~${AC.DELEGATED_COOPERATION}`}
                type={Types.CHECKBOX} />
            </Col>
            <Col md={2} lg={2}>
              <AFField
                parent={this.props.funding} fieldPath={`${AC.FUNDINGS}~${AC.DELEGATED_PARTNER}`}
                type={Types.CHECKBOX} />
            </Col>
          </Row>
        </Grid>
      </FormGroup>
      <AFFundingClassificationPanel funding={this.props.funding} />
      <AFFundingDetailContainer
        fundingDetail={this.state.stateFundingDetail.filter(fd => (fd[AC.TRANSACTION_TYPE].value === VC.COMMITMENTS))}
        type={VC.COMMITMENTS}
        removeFundingDetailItem={this._removeFundingDetailItem} />
      <AFFundingDetailContainer
        fundingDetail={this.state.stateFundingDetail.filter(fd => (fd[AC.TRANSACTION_TYPE].value === VC.DISBURSEMENTS))}
        type={VC.DISBURSEMENTS}
        removeFundingDetailItem={this._removeFundingDetailItem} />
      <AFFundingDetailContainer
        fundingDetail={this.state.stateFundingDetail.filter(fd => (fd[AC.TRANSACTION_TYPE].value === VC.EXPENDITURES))}
        type={VC.EXPENDITURES}
        removeFundingDetailItem={this._removeFundingDetailItem} />
    </div>);
  }
}
