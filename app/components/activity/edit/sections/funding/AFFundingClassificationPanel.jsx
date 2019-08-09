/* eslint-disable class-methods-use-this */
/* eslint-disable react/no-did-update-set-state */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, FormGroup, Grid, Panel, Row } from 'react-bootstrap';
import { ActivityConstants, FieldPathConstants, FieldsManager } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
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
    hasErrors: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this._refreshAfterChanges = this._refreshAfterChanges.bind(this);
    const errors = props.hasErrors(props.funding);
    this.state = {
      errors,
      refresh: 0
    };
    if (errors) {
      props.funding.fundingClassificationOpen = true;
    }
  }

  componentDidUpdate() {
    /* We use componentDidUpdate because the validation of some AFFields (like Commitments)
    occurs after componentWillReceiveProps/componentWillUpdate. */
    this._refreshAfterChanges();
  }

  _refreshAfterChanges() {
    const { funding, hasErrors } = this.props;
    const errors = hasErrors(funding);
    if (errors !== this.state.errors) {
      this.setState({ errors });
    }
  }

  render() {
    // TODO: Add 'agreement' with the same component than locations + a restriction to have only 1 value at the time,
    // this field is not yet implemented on possible-values (and is not used in Chad).
    const { funding } = this.props;
    const hasFundingDetails = FieldPathConstants.TRANSACTION_TYPES.some(tt => funding[tt] && funding[tt].length);
    const hasErrors = this.props.hasErrors(funding);
    return (<div className={afStyles.full_width}>
      <Panel
        header={translate('Funding Classification')} collapsible
        expanded={this.props.funding.fundingClassificationOpen}
        onSelect={() => {
          this.props.funding.fundingClassificationOpen = !this.props.funding.fundingClassificationOpen;
          this.setState({ refresh: Math.random() });
        }} className={hasErrors ? fundingStyles.error : ''}>
        <FormGroup>
          <Grid className={afStyles.full_width}>
            <Row>
              <Col md={4} lg={4}>
                <AFField
                  parent={funding} fieldPath={`${ActivityConstants.FUNDINGS}~${ActivityConstants.TYPE_OF_ASSISTANCE}`}
                  forceRequired={hasFundingDetails} onAfterUpdate={this._refreshAfterChanges}
                />
              </Col>
              <Col md={4} lg={4}>
                <AFField
                  parent={funding} fieldPath={`${ActivityConstants.FUNDINGS}~${ActivityConstants.FINANCING_INSTRUMENT}`}
                  forceRequired={hasFundingDetails} onAfterUpdate={this._refreshAfterChanges}
                />
              </Col>
              <Col md={4} lg={4}>
                <AFField
                  parent={funding} fieldPath={`${ActivityConstants.FUNDINGS}~${ActivityConstants.FINANCING_ID}`}
                  type={INPUT_TYPE}
                  onAfterUpdate={this._refreshAfterChanges} />
              </Col>
            </Row>
            <Row>
              <Col md={4} lg={4}>
                <AFField
                  parent={funding} fieldPath={`${ActivityConstants.FUNDINGS}~${ActivityConstants.FUNDING_STATUS}`}
                  onAfterUpdate={this._refreshAfterChanges} />
              </Col>
              <Col md={4} lg={4}>
                <AFField
                  parent={funding} fieldPath={`${ActivityConstants.FUNDINGS}~${ActivityConstants.MODE_OF_PAYMENT}`}
                  onAfterUpdate={this._refreshAfterChanges} />
              </Col>
              <Col md={4} lg={4}>
                <AFField
                  parent={funding}
                  fieldPath={`${ActivityConstants.FUNDINGS}~${ActivityConstants.FUNDING_CLASSIFICATION_DATE}`}
                  onAfterUpdate={this._refreshAfterChanges} />
              </Col>
            </Row>
          </Grid>
        </FormGroup>
      </Panel>
    </div>);
  }
}
