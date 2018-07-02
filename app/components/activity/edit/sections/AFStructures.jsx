import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, FormControl, FormGroup, Grid, HelpBlock, Row } from 'react-bootstrap';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { STRUCTURES } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import Logger from '../../../../modules/util/LoggerManager';
import afStyles from '../ActivityForm.css';
import * as FMC from '../../../../utils/constants/FeatureManagerConstants';
import * as FPC from '../../../../utils/constants/FieldPathConstants';
import { ACTIVITY_ORGANIZATIONS_DONOR_ORGANIZATION } from '../../../../utils/constants/FeatureManagerConstants';

const logger = new Logger('AF Structures');

/**
 * Organizations Section
 * @author Gabriel Inchauspe
 */
class AFStructures extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.setState({ validationError: undefined });
  }

  render() {
    const { activity } = this.props;
    return (<div className={afStyles.full_width}>
      <Grid className={afStyles.full_width}>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={activity}
              fieldPath={AC.STRUCTURES} />
          </Col>
        </Row>
      </Grid>
    </div>);
  }
}

export default AFSection(AFStructures, STRUCTURES);
