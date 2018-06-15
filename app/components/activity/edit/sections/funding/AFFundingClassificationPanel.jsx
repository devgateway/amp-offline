/* eslint-disable class-methods-use-this */
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
    hasErrors: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.state = {
      openFCP: false
    };
  }

  componentWillReceiveProps(nextProps) {
    // Expand the section that has errors.
    if (this.props.hasErrors(nextProps.funding)) {
      this.setState({ openFCP: true });
    }
  }

  render() {
    // TODO: Add 'agreement' with the same component than locations + a restriction to have only 1 value at the time,
    // this field is not yet implemented on possible-values (and is not used in Chad).
    const { fundingDetails } = this.props;
    const hasFundingDetails = fundingDetails && fundingDetails.length > 0;
    const hasErrors = this.props.hasErrors(this.props.funding);
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
                  parent={this.props.funding} fieldPath={`${AC.FUNDINGS}~${AC.TYPE_OF_ASSISTANCE}`}
                  forceRequired={hasFundingDetails}
                />
              </Col>
              <Col md={4} lg={4}>
                <AFField
                  parent={this.props.funding} fieldPath={`${AC.FUNDINGS}~${AC.FINANCING_INSTRUMENT}`}
                  forceRequired={hasFundingDetails}
                />
              </Col>
              <Col md={4} lg={4}>
                <AFField
                  parent={this.props.funding} fieldPath={`${AC.FUNDINGS}~${AC.FINANCING_ID}`} type={INPUT_TYPE} />
              </Col>
            </Row>
            <Row>
              <Col md={4} lg={4}>
                <AFField parent={this.props.funding} fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_STATUS}`} />
              </Col>
              <Col md={4} lg={4}>
                <AFField parent={this.props.funding} fieldPath={`${AC.FUNDINGS}~${AC.MODE_OF_PAYMENT}`} />
              </Col>
              <Col md={4} lg={4}>
                <AFField
                  parent={this.props.funding} fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_CLASSIFICATION_DATE}`} />
              </Col>
            </Row>
          </Grid>
        </FormGroup>
      </Panel>
    </div>);
  }
}
