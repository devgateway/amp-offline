import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Section from './Section';
import Logger from '../../../../modules/util/LoggerManager';
import * as AC from '../../../../utils/constants/ActivityConstants';
import translate from '../../../../utils/translate';
import styles from '../ActivityPreview.css';
import * as Utils from '../../../../utils/Utils';

const logger = new Logger('AP structures');

/**
 * Activity Preview Structures section
 * @author Gabriel Inchauspe
 */
class APStructures extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired,
    buildSimpleField: PropTypes.func.isRequired
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
    logger.debug('constructor');
  }

  getCoordinates(structure) {
    const { buildSimpleField } = this.props;
    let isPoint = false;
    if (!structure[AC.STRUCTURES_SHAPE]) {
      if (!structure[AC.STRUCTURES_LATITUDE] || !structure[AC.STRUCTURES_LONGITUDE]) {
        isPoint = false;
      } else {
        isPoint = true;
      }
    } else if (structure[AC.STRUCTURES_SHAPE] === AC.STRUCTURES_POINT) {
      isPoint = true;
    } else {
      isPoint = false;
    }
    if (isPoint) {
      const content = [];
      content.push(
        buildSimpleField(`${[AC.STRUCTURES]}~${[AC.STRUCTURES_LATITUDE]}`, true, null, false, structure));
      content.push(
        buildSimpleField(`${[AC.STRUCTURES]}~${[AC.STRUCTURES_LONGITUDE]}`, true, null, false, structure));
      return content;
    } else {
      const content = [];
      structure[AC.STRUCTURES_COORDINATES].forEach(c => {
        content.push(
          <tr key={Utils.stringToUniqueId()}>
            <td>{buildSimpleField(`${[AC.STRUCTURES]}~${AC.STRUCTURES_COORDINATES}~${[AC.STRUCTURES_LATITUDE]}`,
              true, null, true, c, null, { noTitle: true, fieldValueClass: styles.structures_coordinates_value })}</td>
            <td>{buildSimpleField(`${[AC.STRUCTURES]}~${AC.STRUCTURES_COORDINATES}~${[AC.STRUCTURES_LONGITUDE]}`,
              true, null, true, c, null, { noTitle: true, fieldValueClass: styles.structures_coordinates_value })}</td>
          </tr>);
      });
      return (
        <table className={styles.structures_coordinates_table}>
          <thead>
            <tr>
              <th><span className={styles.section_field_name}>{translate('Coordinates')}</span></th>
            </tr>
          </thead>
          <tbody>
            {content}
          </tbody>
        </table>);
    }
  }

  render() {
    const { activity, buildSimpleField } = this.props;
    if (activity[AC.STRUCTURES]) {
      return (
        <div>{activity[AC.STRUCTURES].sort((a, b) => (a[AC.STRUCTURES_TITLE] > b[AC.STRUCTURES_TITLE])).map(s => (
          <div key={Math.random()}>
            <div className={styles.structure_title}>{s[AC.STRUCTURES_TITLE]}</div>
            {buildSimpleField(`${[AC.STRUCTURES]}~${[AC.STRUCTURES_TITLE]}`, true, null, false, s)}
            {buildSimpleField(`${[AC.STRUCTURES]}~${[AC.STRUCTURES_DESCRIPTION]}`, false, null, false, s)}
            {this.getCoordinates(s)}
          </div>)
        )}
        </div>
      );
    }
    return null;
  }
}

export default Section(APStructures, 'Structures', true, 'APStructures');