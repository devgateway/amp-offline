import React, { Component, PropTypes } from 'react';
import Section from './Section';
import Logger from '../../../../modules/util/LoggerManager';
import FieldsManager from '../../../../modules/field/FieldsManager';
import * as AC from '../../../../utils/constants/ActivityConstants';

const logger = new Logger('AP structures');

/**
 * Activity Preview Structures section
 * @author Gabriel Inchauspe
 */
class APStructures extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  static getCoordinates(structure) {
    if (structure[AC.STRUCTURES_SHAPE] === AC.STRUCTURES_POINT) {
      return (<div>
        <div>{structure[AC.STRUCTURES_LATITUDE]}</div>
        <div>{structure[AC.STRUCTURES_LONGITUDE]}</div>
      </div>);
    } else {
      return (<div>
        {structure[AC.STRUCTURES_COORDINATES].map(c => (<div>
          <div>{c[AC.STRUCTURES_LATITUDE]}</div>
          <div>{c[AC.STRUCTURES_LONGITUDE]}</div>
        </div>))}
      </div>);
    }
  }

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  render() {
    const { activity } = this.props;
    if (activity[AC.STRUCTURES]) {
      return (
        <div>{activity[AC.STRUCTURES].map(s => (
          <div>
            <div>{s[AC.STRUCTURES_TITLE]}</div>
            <div>{s[AC.STRUCTURES_DESCRIPTION]}</div>
            {APStructures.getCoordinates(s)}
          </div>)
        )}
        </div>);
    }
    return null;
  }
}

export default Section(APStructures, 'Structures', true, 'APStructures');
