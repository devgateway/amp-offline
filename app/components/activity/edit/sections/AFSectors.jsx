import React, { Component, PropTypes } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import { ActivityConstants } from 'amp-ui';
import afStyles from '../ActivityForm.css';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { SECTORS } from './AFSectionConstants';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AF sectors');

/**
 * Sectors Section
 * @author Nadejda Mandrescu
 */
class AFSectors extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  render() {
    return (<div className={afStyles.full_width}>
      <Grid className={afStyles.full_width}>
        <Row>
          <Col md={12} lg={12}>
            <AFField parent={this.props.activity} fieldPath={ActivityConstants.PRIMARY_SECTORS} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField parent={this.props.activity} fieldPath={ActivityConstants.SECONDARY_SECTORS} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField parent={this.props.activity} fieldPath={ActivityConstants.TERTIARY_SECTORS} />
          </Col>
        </Row>
      </Grid>
    </div>);
  }
}

export default AFSection(AFSectors, SECTORS);
