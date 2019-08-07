import React, { Component, PropTypes } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import { ActivityConstants } from 'amp-ui';
import afStyles from '../ActivityForm.css';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { PROGRAM } from './AFSectionConstants';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AF programs');

/**
 * Programs Section
 * @author Nadejda Mandrescu
 */
class AFPrograms extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  render() {
    return (<div className={afStyles.full_width} >
      <Grid className={afStyles.full_width} >
        <Row>
          <Col md={12} lg={12} >
            <AFField parent={this.props.activity} fieldPath={ActivityConstants.NATIONAL_PLAN_OBJECTIVE} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12} >
            <AFField parent={this.props.activity} fieldPath={ActivityConstants.PRIMARY_PROGRAMS} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12} >
            <AFField parent={this.props.activity} fieldPath={ActivityConstants.SECONDARY_PROGRAMS} />
          </Col>
        </Row>
      </Grid>
    </div>);
  }
}

export default AFSection(AFPrograms, PROGRAM);
