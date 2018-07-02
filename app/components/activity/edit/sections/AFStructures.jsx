import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Grid, Panel, Row } from 'react-bootstrap';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { STRUCTURES } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import Logger from '../../../../modules/util/LoggerManager';
import afStyles from '../ActivityForm.css';
import * as Types from '../components/AFComponentTypes';
import translate from '../../../../utils/translate';

const logger = new Logger('AF Structures');

/**
 * Organizations Section
 * @author Gabriel Inchauspe
 */
class AFStructures extends Component {

  static contextTypes = {
    activity: PropTypes.object.isRequired
  };

  static propTypes = {};

  static generateTable(structure) {
    const content = [];
    content.push(<Col md={3} lg={3}>
      <AFField fieldPath={`${AC.STRUCTURES}~${AC.STRUCTURES_TITLE}`} parent={structure} type={Types.TEXT_AREA} />
    </Col>);
    content.push(<Col md={3} lg={3}>
      <AFField fieldPath={`${AC.STRUCTURES}~${AC.STRUCTURES_DESCRIPTION}`} parent={structure} type={Types.TEXT_AREA} />
    </Col>);
    content.push(<Col md={3} lg={3}>
      <AFField
        fieldPath={`${AC.STRUCTURES}~${AC.STRUCTURES_LATITUDE}`} parent={structure} type={Types.NUMBER}
        extraParams={{ readonly: true }} />
    </Col>);
    content.push(<Col md={3} lg={3}>
      <AFField
        fieldPath={`${AC.STRUCTURES}~${AC.STRUCTURES_LONGITUDE}`} parent={structure} type={Types.NUMBER}
        extraParams={{ readonly: true }} />
    </Col>);
    return content;
  }

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  preProcessForIds() {
    const { activity } = this.context;
    if (activity[AC.STRUCTURES]) {
      activity[AC.STRUCTURES].forEach(s => {
        if (!s.id) {
          s.id = Math.random();
        }
      });
    }
  }

  render() {
    this.preProcessForIds();
    const { activity } = this.context;
    return (<div className={afStyles.full_width}>
      <Grid className={afStyles.full_width}>
        {activity[AC.STRUCTURES].map(s => (
          <Row><Panel header={translate('Structure')}>{this.generateTable(s)}</Panel></Row>))}
      </Grid>
    </div>);
  }
}

export default AFSection(AFStructures, STRUCTURES);
