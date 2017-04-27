import React, { Component, PropTypes } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import afStyles from '../ActivityForm.css';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { RICH_TEXT_AREA } from '../components/AFComponentTypes';
import { IDENTIFICATION } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Identification Section
 * @author Nadejda Mandrescu
 */
class AFIdentification extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    // TODO update the layout per Llanoc design. If not available, adjust to work. For now grouping fields as in AMP.
    return (
      <div className={afStyles.full_width} >
        <Grid >
          <Row>
            <Col md={9} lg={7} >
              <AFField parent={this.props.activity} fieldPath={AC.PROJECT_TITLE} />
            </Col>
          </Row>
          <Row>
            <Col md={4} lg={3} >
              <div>
                <AFField parent={this.props.activity} fieldPath={AC.ACTIVITY_STATUS} />
              </div>
              <div>
                <AFField parent={this.props.activity} fieldPath={AC.STATUS_REASON} />
              </div>
              <div >
                <AFField parent={this.props.activity} fieldPath={AC.OBJECTIVE} type={RICH_TEXT_AREA} />
              </div>
              <div>
                <AFField parent={this.props.activity} fieldPath={AC.LESSONS_LEARNED} />
              </div>
              <div>
                <AFField parent={this.props.activity} fieldPath={AC.PROJECT_IMPACT} />
              </div>
              <div>
                <AFField parent={this.props.activity} fieldPath={AC.ACTIVITY_SUMMARY} />
              </div>
            </Col>
            <Col mdOffset={1} md={4} lg={3} >
              <div>
                <AFField parent={this.props.activity} fieldPath={AC.ACTIVITY_BUDGET} />
              </div>
            </Col>
          </Row>
        </Grid>
      </ div >);
  }
}

export default AFSection(AFIdentification, IDENTIFICATION);
