import React, { Component, PropTypes } from 'react';
import Section from './Section';
import Logger from '../../../../modules/util/LoggerManager';
import * as AC from '../../../../utils/constants/ActivityConstants';
import translate from '../../../../utils/translate';
import styles from '../ActivityPreview.css';

const logger = new Logger('AP structures');

/**
 * Activity Preview Structures section
 * @author Gabriel Inchauspe
 */
class APStructures extends Component {

  static propTypes = {
    buildSimpleField: PropTypes.func.isRequired,
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
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
          <tr>
            <td>{buildSimpleField(`${[AC.STRUCTURES]}~${AC.STRUCTURES_COORDINATES}~${[AC.STRUCTURES_LATITUDE]}`,
              true, null, true, c, null, { noTitle: true, fieldValueClass: styles.structures_coordinates_value })}</td>
            <td>{buildSimpleField(`${[AC.STRUCTURES]}~${AC.STRUCTURES_COORDINATES}~${[AC.STRUCTURES_LONGITUDE]}`,
              true, null, true, c, null, { noTitle: true, fieldValueClass: styles.structures_coordinates_value })}</td>
          </tr>);
      });
      return (
        <table className={styles.structures_coordinates_table}>
          <tbody>
            <thead>
              <th><span className={styles.section_field_name}>{translate('Coordinates')}</span></th>
            </thead>
            {content}
          </tbody>
        </table>);
    }
  }

  render() {
    const { activity, buildSimpleField } = this.props;
    if (activity[AC.STRUCTURES]) {
      return (
        <div>{activity[AC.STRUCTURES].map(s => (
          <div>
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
