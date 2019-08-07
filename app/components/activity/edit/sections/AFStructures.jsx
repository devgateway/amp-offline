import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Grid, Panel, Row } from 'react-bootstrap';
import isNumber from 'is-number';
import { ActivityConstants } from 'amp-ui';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { STRUCTURES } from './AFSectionConstants';
import Logger from '../../../../modules/util/LoggerManager';
import afStyles from '../ActivityForm.css';
import * as Types from '../components/AFComponentTypes';
import translate from '../../../../utils/translate';
import AFViewStructure from './structures/AFViewStructure';
import AFMapWindow from './structures/AFMapWindow';
import MapTilesUtils from '../../../../utils/MapTilesUtils';
import FeatureManager from '../../../../modules/util/FeatureManager';
import * as FMC from '../../../../utils/constants/FeatureManagerConstants';

const logger = new Logger('AF Structures');

/**
 * Organizations Section
 * @author Gabriel Inchauspe
 */
class AFStructures extends Component {

  static contextTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.object
  };

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  static hasCoordinates(structure) {
    return structure[ActivityConstants.STRUCTURES_COORDINATES] &&
      structure[ActivityConstants.STRUCTURES_COORDINATES].length;
  }

  static detectShapePoint(structure) {
    if (!structure[ActivityConstants.STRUCTURES_SHAPE] && !AFStructures.hasCoordinates(structure)) {
      return true;
    }
    return structure[ActivityConstants.STRUCTURES_SHAPE] === ActivityConstants.STRUCTURES_POINT;
  }

  static generateDataRow(structure) {
    const content = [];
    content.push(<Col md={3} lg={3} key={Math.random()}>
      <AFField
        fieldPath={`${ActivityConstants.STRUCTURES}~${ActivityConstants.STRUCTURES_TITLE}`} parent={structure}
        type={Types.TEXT_AREA} />
    </Col>);
    content.push(<Col md={3} lg={3} key={Math.random()}>
      <AFField
        fieldPath={`${ActivityConstants.STRUCTURES}~${ActivityConstants.STRUCTURES_DESCRIPTION}`}
        parent={structure} type={Types.TEXT_AREA} />
    </Col>);
    if (AFStructures.detectShapePoint(structure)) {
      content.push(<Col md={3} lg={3} key={Math.random()}>
        <AFField
          fieldPath={`${ActivityConstants.STRUCTURES}~${ActivityConstants.STRUCTURES_LATITUDE}`} parent={structure}
          type={Types.TEXT_AREA} />
      </Col>);
      content.push(<Col md={3} lg={3} key={Math.random()}>
        <AFField
          fieldPath={`${ActivityConstants.STRUCTURES}~${ActivityConstants.STRUCTURES_LONGITUDE}`} parent={structure}
          type={Types.TEXT_AREA} />
      </Col>);
    }
    return content;
  }

  static checkLatLng(structure) {
    return isNumber(structure[ActivityConstants.STRUCTURES_LATITUDE]) &&
      isNumber(structure[ActivityConstants.STRUCTURES_LONGITUDE]);
  }

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.handleDelete = this.handleDelete.bind(this);
    this.openMap = this.openMap.bind(this);
    this.handleViewCoordinates = this.handleViewCoordinates.bind(this);
    this.handleSaveMap = this.handleSaveMap.bind(this);
    this.handleCloseMap = this.handleCloseMap.bind(this);
    this.handleAddEmptyStructure = this.handleAddEmptyStructure.bind(this);
    this.state = {
      structures: props.activity[ActivityConstants.STRUCTURES] || [],
      showViewDialog: false,
      viewStructure: null,
      showMapDialog: false,
      currentPoint: null,
      currentPolygon: null
    };
  }

  preProcessForIds() {
    if (this.state.structures) {
      this.state.structures.forEach(s => {
        s[ActivityConstants.TEMPORAL_ID] = s.id || s[ActivityConstants.TEMPORAL_ID] || Math.random();
      });
    }
  }

  generateButtonRow(structure, i) {
    return (<Col md={12} lg={12}>
      {(MapTilesUtils.detectContent()) ? <Button
        bsStyle="primary" className={afStyles.button}
        onClick={this.openMap.bind(this, structure)}>{translate('Map')}
      </Button> : null}
      {!AFStructures.detectShapePoint(structure)
        ? <Button
          bsStyle="primary" className={afStyles.button}
          onClick={this.handleViewCoordinates.bind(this, structure)}>{translate('View')}
        </Button>
        : null}
      <Button
        bsStyle="danger" className={afStyles.button}
        onClick={this.handleDelete.bind(this, structure, i)}>{translate('Delete')}
      </Button>
    </Col>);
  }

  handleViewCoordinates(structure) {
    this.setState({ showViewDialog: true, viewStructure: structure });
  }

  openMap(structure) {
    if (AFStructures.detectShapePoint(structure)) {
      const point = {
        id: structure.id,
        [ActivityConstants.TEMPORAL_ID]: structure[ActivityConstants.TEMPORAL_ID],
        [ActivityConstants.STRUCTURES_TITLE]: structure[ActivityConstants.STRUCTURES_TITLE],
        [ActivityConstants.STRUCTURES_LAT]: structure[ActivityConstants.STRUCTURES_LATITUDE],
        [ActivityConstants.STRUCTURES_LNG]: structure[ActivityConstants.STRUCTURES_LONGITUDE],
        [ActivityConstants.STRUCTURES_DESCRIPTION]: structure[ActivityConstants.STRUCTURES_DESCRIPTION],
        [ActivityConstants.STRUCTURES_SHAPE]: ActivityConstants.STRUCTURES_POINT
      };
      if (!AFStructures.checkLatLng(structure)) {
        point[ActivityConstants.STRUCTURES_LATITUDE] = null;
        point[ActivityConstants.STRUCTURES_LONGITUDE] = null;
      }
      this.setState({
        showMapDialog: true,
        currentPoint: point,
        currentPolygon: null
      });
    } else {
      this.setState({
        showMapDialog: true,
        currentPolygon: {
          id: structure.id,
          [ActivityConstants.TEMPORAL_ID]: structure[ActivityConstants.TEMPORAL_ID],
          [ActivityConstants.STRUCTURES_COORDINATES]: structure[ActivityConstants.STRUCTURES_COORDINATES],
          [ActivityConstants.STRUCTURES_COLOR]: structure[ActivityConstants.STRUCTURES_COLOR],
          [ActivityConstants.STRUCTURES_TITLE]: structure[ActivityConstants.STRUCTURES_TITLE],
          [ActivityConstants.STRUCTURES_DESCRIPTION]: structure[ActivityConstants.STRUCTURES_DESCRIPTION],
          [ActivityConstants.STRUCTURES_SHAPE]: ActivityConstants.STRUCTURES_POLYGON
        },
        currentPoint: null
      });
    }
  }

  handleDelete(structure, i) {
    const newStructures = this.state.structures.slice();
    newStructures.splice(i, 1);
    this.setState({ structures: newStructures });
    this.context.activity[ActivityConstants.STRUCTURES] = newStructures;
  }

  handleCloseMap() {
    this.setState({ showMapDialog: false });
  }

  handleAddEmptyStructure() {
    const newStructures = this.state.structures.slice();
    newStructures.push({
      [ActivityConstants.STRUCTURES_TITLE]: '',
      [ActivityConstants.STRUCTURES_DESCRIPTION]: '',
      [ActivityConstants.STRUCTURES_LATITUDE]: null,
      [ActivityConstants.STRUCTURES_LONGITUDE]: null,
      [ActivityConstants.STRUCTURES_SHAPE]: ActivityConstants.STRUCTURES_POINT,
      [ActivityConstants.STRUCTURES_COORDINATES]: [],
      [ActivityConstants.TEMPORAL_ID]: Math.random()
    });
    this.setState({ structures: newStructures });
    this.context.activity[ActivityConstants.STRUCTURES] = newStructures;
  }

  handleSaveMap(layersList, deletedLayersList) {
    // Add new layer or replace with changes.
    const newStructures = this.state.structures.slice();
    layersList.forEach(l => {
      const index = newStructures.findIndex(s =>
        (s[ActivityConstants.TEMPORAL_ID] === l.structureData[ActivityConstants.TEMPORAL_ID]));
      if (index > -1) {
        newStructures.splice(index, 1);
      }
      if (AFStructures.detectShapePoint(l.structureData)) {
        newStructures.push({
          [ActivityConstants.STRUCTURES_TITLE]: l.structureData[ActivityConstants.STRUCTURES_TITLE],
          [ActivityConstants.STRUCTURES_DESCRIPTION]: l.structureData[ActivityConstants.STRUCTURES_DESCRIPTION],
          [ActivityConstants.STRUCTURES_LATITUDE]: String(l.layer.getLatLng()[ActivityConstants.STRUCTURES_LAT]),
          [ActivityConstants.STRUCTURES_LONGITUDE]: String(l.layer.getLatLng()[ActivityConstants.STRUCTURES_LNG]),
          [ActivityConstants.STRUCTURES_SHAPE]: ActivityConstants.STRUCTURES_POINT,
          [ActivityConstants.STRUCTURES_COORDINATES]: [],
          id: l.structureData.id,
          [ActivityConstants.TEMPORAL_ID]: l.structureData[ActivityConstants.TEMPORAL_ID] || Math.random()
        });
      } else {
        const coordinates = l.layer._latlngs[1] !== undefined
          ? l.layer._latlngs.map(loc => ({
            [ActivityConstants.STRUCTURES_LATITUDE]: String(loc.lat),
            [ActivityConstants.STRUCTURES_LONGITUDE]: String(loc.lng)
          }))
          : l.layer._latlngs[0].map(loc => ({
            [ActivityConstants.STRUCTURES_LATITUDE]: String(loc.lat),
            [ActivityConstants.STRUCTURES_LONGITUDE]: String(loc.lng)
          }));
        newStructures.push({
          [ActivityConstants.STRUCTURES_TITLE]: l.structureData[ActivityConstants.STRUCTURES_TITLE],
          [ActivityConstants.STRUCTURES_DESCRIPTION]: l.structureData[ActivityConstants.STRUCTURES_DESCRIPTION],
          [ActivityConstants.STRUCTURES_SHAPE]: ActivityConstants.STRUCTURES_POLYGON,
          [ActivityConstants.STRUCTURES_COORDINATES]: [],
          id: l.structureData.id,
          [ActivityConstants.TEMPORAL_ID]: l.structureData[ActivityConstants.TEMPORAL_ID] || Math.random(),
          [ActivityConstants.STRUCTURES_COORDINATES]: coordinates,
          [ActivityConstants.STRUCTURES_COLOR]: l.structureData[ActivityConstants.STRUCTURES_COLOR]
        });
      }
    });
    // Remove deleted layers.
    deletedLayersList.forEach(l => {
      const index = newStructures.findIndex(s =>
        (s[ActivityConstants.TEMPORAL_ID] === l[ActivityConstants.TEMPORAL_ID]));
      if (index > -1) {
        newStructures.splice(index, 1);
      }
    });
    this.setState({ structures: newStructures, showMapDialog: false });
    this.context.activity[ActivityConstants.STRUCTURES] = newStructures;
  }

  render() {
    this.preProcessForIds();
    return (<div className={afStyles.full_width}>

      {FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_STRUCTURES_ADD_STRUCTURE) ? <Button
        bsStyle="primary" className={afStyles.button}
        onClick={this.handleAddEmptyStructure}>{translate('Add Structure')}
      </Button> : null}

      <AFViewStructure
        show={this.state.showViewDialog}
        structure={this.state.viewStructure}
        onClose={() => this.setState({ showViewDialog: false, viewStructure: null })}
      />

      <AFMapWindow
        show={this.state.showMapDialog}
        onModalClose={this.handleCloseMap}
        onSave={this.handleSaveMap}
        polygon={this.state.currentPolygon}
        point={this.state.currentPoint} />

      <Grid className={afStyles.full_width}>
        {this.state.structures.sort((a, b) =>
          (a[ActivityConstants.STRUCTURES_TITLE] > b[ActivityConstants.STRUCTURES_TITLE]))
          .map((s, i) => (
            <Panel key={Math.random()} header={translate('Structure')}>
              <Row>{AFStructures.generateDataRow(s)}</Row>
              <Row>{this.generateButtonRow(s, i)}</Row>
            </Panel>))}
      </Grid>
    </div>);
  }
}

export default AFSection(AFStructures, STRUCTURES);
