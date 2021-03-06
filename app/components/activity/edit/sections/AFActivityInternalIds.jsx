import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Col, Grid, Row } from 'react-bootstrap';
import { ActivityConstants } from 'amp-ui';
import afStyles from '../ActivityForm.css';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { ACTIVITY_INTERNAL_IDS } from './AFSectionConstants';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AF activity internal ids');

/**
 * Activity Internal IDs section
 * @author Nadejda Mandrescu
 */
class AFActivityInternalIds extends Component {

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
            <AFField parent={this.props.activity} fieldPath={ActivityConstants.ACTIVITY_INTERNAL_IDS} />
          </Col>
        </Row>
      </Grid>
    </div>);
  }
}

export default AFSection(AFActivityInternalIds, ACTIVITY_INTERNAL_IDS);
