/* eslint-disable class-methods-use-this */
/* eslint-disable react/no-did-update-set-state */
import React, { Component, PropTypes } from 'react';
import { Col, FormGroup, Grid, Panel, Row } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import Logger from '../../../../../modules/util/LoggerManager';
import FieldsManager from '../../../../../modules/field/FieldsManager';
import translate from '../../../../../utils/translate';
import AFField from '../../components/AFField';
import afStyles from '../../ActivityForm.css';
import { INPUT_TYPE } from '../../components/AFComponentTypes';
import fundingStyles from './AFFundingContainer.css';

const logger = new Logger('AF Funding classication panel');

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingClassificationPanel extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired
  };

  static propTypes = {
    funding: PropTypes.object.isRequired,
    fundingDetails: PropTypes.array.isRequired,
    hasErrors: PropTypes.func.isRequired,
    refreshFundingDonorSectionErrors: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this._refreshAfterChanges = this._refreshAfterChanges.bind(this);
    this.state = {
      openFCP: this.props.hasErrors(props.funding) || props.funding.open,
      showingErrors: this.props.hasErrors(props.funding)
    };
  }

  componentDidUpdate() {
    /* We use componentDidUpdate because the validation of some AFFields (like Commitments)
    occurs after componentWillReceiveProps/componentWillUpdate. */
    this._refreshAfterChanges();
  }

  _refreshAfterChanges() {
    const { funding, hasErrors, refreshFundingDonorSectionErrors } = this.props;
    const errors = hasErrors(funding);
    if (errors !== this.state.showingErrors) {
      this.setState({ showingErrors: errors, openFCP: this.state.openFCP || errors });
      refreshFundingDonorSectionErrors(errors);
    }
  }

  render() {
    // TODO: Add 'agreement' with the same component than locations + a restriction to have only 1 value at the time,
    // this field is not yet implemented on possible-values (and is not used in Chad).
    const { fundingDetails, funding } = this.props;
    const hasFundingDetails = fundingDetails && fundingDetails.length > 0;
    const hasErrors = this.props.hasErrors(funding);
    return (<div className={afStyles.full_width}>
      <Panel
        header={translate('Funding Classification')} collapsible expanded={this.state.openFCP}
        onSelect={() => {
          this.setState({ openFCP: !this.state.openFCP });
        }} className={hasErrors ? fundingStyles.error : ''}>
        <FormGroup>
          <Grid className={afStyles.full_width}>
            <Row>
              <Col md={4} lg={4}>
                <AFField
                  parent={funding} fieldPath={`${AC.FUNDINGS}~${AC.TYPE_OF_ASSISTANCE}`}
                  forceRequired={hasFundingDetails} onAfterUpdate={this._refreshAfterChanges}
                />
              </Col>
              <Col md={4} lg={4}>
                <AFField
                  parent={funding} fieldPath={`${AC.FUNDINGS}~${AC.FINANCING_INSTRUMENT}`}
                  forceRequired={hasFundingDetails} onAfterUpdate={this._refreshAfterChanges}
                />
              </Col>
              <Col md={4} lg={4}>
                <AFField
                  parent={funding} fieldPath={`${AC.FUNDINGS}~${AC.FINANCING_ID}`} type={INPUT_TYPE}
                  onAfterUpdate={this._refreshAfterChanges} />
              </Col>
            </Row>
            <Row>
              <Col md={4} lg={4}>
                <AFField
                  parent={funding} fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_STATUS}`}
                  onAfterUpdate={this._refreshAfterChanges} />
              </Col>
              <Col md={4} lg={4}>
                <AFField
                  parent={funding} fieldPath={`${AC.FUNDINGS}~${AC.MODE_OF_PAYMENT}`}
                  onAfterUpdate={this._refreshAfterChanges} />
              </Col>
              <Col md={4} lg={4}>
                <AFField
                  parent={funding} fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_CLASSIFICATION_DATE}`}
                  onAfterUpdate={this._refreshAfterChanges} />
              </Col>
            </Row>
          </Grid>
        </FormGroup>
      </Panel>
    </div>);
  }
}
