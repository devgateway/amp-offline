import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, FormControl, FormGroup, Grid, HelpBlock, Row } from 'react-bootstrap';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { STRUCTURES } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import Logger from '../../../../modules/util/LoggerManager';
import afStyles from '../ActivityForm.css';
import * as Types from '../components/AFComponentTypes';
import * as FMC from '../../../../utils/constants/FeatureManagerConstants';
import * as FPC from '../../../../utils/constants/FieldPathConstants';
import { ACTIVITY_ORGANIZATIONS_DONOR_ORGANIZATION } from '../../../../utils/constants/FeatureManagerConstants';
import FieldsManager from '../../../../modules/field/FieldsManager';

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

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  preProcessForIds() {
    const { activity } = this.context;
    if (activity[AC.STRUCTURES]) {
      activity[AC.STRUCTURES].forEach(s => {
        // Maybe we will change the EP to send the id, anyway we need an id field for the AFSelector.
        if (!s.id) {
          s.id = Math.random();
        }
        /* TODO: Check if we need to remove this old field from the API because it breaks our component
        ("type" is null but reported as id_only: true). */
        delete s.type; // en lugar de borrar crearle un {id: random}
      });
    }
  }

  generateTable(structure) {
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

  render() {
    this.preProcessForIds();
    const { activity } = this.context;
    return (<div className={afStyles.full_width}>
      <Grid className={afStyles.full_width}>
        {activity[AC.STRUCTURES].map(s => (<Row>{this.generateTable(s)}</Row>))}
      </Grid>
    </div>);
  }
}

export default AFSection(AFStructures, STRUCTURES);
