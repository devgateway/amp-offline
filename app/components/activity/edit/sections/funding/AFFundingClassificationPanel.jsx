/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { Panel, PanelGroup, FormGroup, Col, Grid, Row } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import translate from '../../../../../utils/translate';
import AFField from '../../components/AFField';
import * as AF from '../../components/AFComponentTypes';
import afStyles from '../../ActivityForm.css';

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingClassificationPanel extends Component {

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

  componentWillMount() {
    this.setState({ activeKey: 0 });
  }

  handlePanelSelect(activeKey) {
    this.setState({ activeKey });
  }

  render() {
    // TODO: Add 'agreement' with the same component than locations + a restriction to have only 1 value at the time,
    // this field is not yet implemented on possible-values.
    return (<div className={afStyles.full_width}>
      <PanelGroup activeKey={this.state.activeKey} onSelect={this.handlePanelSelect.bind(this)} accordion>
        <Panel header={translate('Funding Classification')} eventKey={0}>
          <FormGroup>
            <Grid className={afStyles.full_width}>
              <Row>
                <Col md={4} lg={4}>
                  <AFField parent={this.props.funding} fieldPath={`${AC.FUNDINGS}~${AC.TYPE_OF_ASSISTANCE}`} />
                </Col>
                <Col md={4} lg={4}>
                  <AFField parent={this.props.funding} fieldPath={`${AC.FUNDINGS}~${AC.FINANCING_INSTRUMENT}`} />
                </Col>
                <Col md={4} lg={4}>
                  <AFField
                    parent={this.props.funding} fieldPath={`${AC.FUNDINGS}~${AC.FINANCING_ID}`} type={AF.NUMBER} />
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
      </PanelGroup>
    </div>);
  }
}
