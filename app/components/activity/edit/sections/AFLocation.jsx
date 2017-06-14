import React, { Component, PropTypes } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import afStyles from '../ActivityForm.css';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { LOCATION } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Location Section
 * @author Nadejda Mandrescu
 */
class AFLocation extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return (<div className={afStyles.full_width} >
      <Grid className={afStyles.full_width} >
        <Row>
          <Col md={6} lg={6} >
            <AFField parent={this.props.activity} fieldPath={AC.IMPLEMENTATION_LEVEL} />
          </Col>
          <Col md={6} lg={6} >
            <AFField parent={this.props.activity} fieldPath={AC.IMPLEMENTATION_LOCATION} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12} >
            <AFField parent={this.props.activity} fieldPath={AC.LOCATIONS} />
          </Col>
        </Row>
        <Row />
      </Grid>
    </div>);
  }
}

export default AFSection(AFLocation, LOCATION);
