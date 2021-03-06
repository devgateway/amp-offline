/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import L from 'leaflet';
import LD from 'leaflet-draw';
import path from 'path';
import { ActivityConstants, Constants, GlobalSettingsConstants } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import styles from './AFMapWindow.css';
import GlobalSettingsManager from '../../../../../modules/util/GlobalSettingsManager';
import FileManager from '../../../../../modules/util/FileManager';
import AFMapPopup from './AFMapPopup';
import GazetteerHelper from '../../../../../modules/helpers/GazetteerHelper';
import * as MapTilesUtils from '../../../../../utils/MapTilesUtils';

const logger = new Logger('Map Modal');
const myIconMarker = L.icon({
  iconUrl: Constants.MAP_MARKER_IMAGE,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [-3, -76],
  shadowUrl: Constants.MAP_MARKER_SHADOW
});
const circleIconMarker = L.icon({
  iconUrl: Constants.MAP_MARKER_CIRCLE_RED,
  iconSize: [20, 20],
  iconAnchor: [9, 9],
  popupAnchor: [0, 0]
});
const OPACITY = '0.5';

/**
 * Map Modal
 *
 * @author Gabriel Inchauspe
 */
export default class AFMapWindow extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.object
  };

  static propTypes = {
    onModalClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    point: PropTypes.object,
    polygon: PropTypes.object
  };

  static translateLeaflet() {
    // Setup controls (with translations).
    L.drawLocal.draw.toolbar.buttons.polygon = translate('Draw a polygon');
    L.drawLocal.draw.toolbar.buttons.marker = translate('Draw a marker');
    L.drawLocal.draw.toolbar.buttons.rectangle = translate('Draw a rectangle');
    L.drawLocal.draw.toolbar.buttons.polyline = translate('Draw a polyline');
    L.drawLocal.draw.toolbar.finish.title = translate('Finish drawing');
    L.drawLocal.draw.toolbar.finish.text = translate('Finish');
    L.drawLocal.draw.toolbar.undo.title = translate('Delete last point drawn');
    L.drawLocal.draw.toolbar.undo.text = translate('Delete last point');
    L.drawLocal.draw.toolbar.actions.title = translate('Cancel drawing');
    L.drawLocal.draw.toolbar.actions.text = translate('Cancel');
    L.drawLocal.draw.handlers.polyline.tooltip.start = translate('Click to start drawing line');
    L.drawLocal.draw.handlers.polyline.tooltip.cont = translate('Click to continue drawing line');
    L.drawLocal.draw.handlers.polyline.tooltip.end = translate('Click last point to finish line');
    L.drawLocal.draw.handlers.rectangle.tooltip.start = translate('Click and drag to draw rectangle');
    L.drawLocal.draw.handlers.simpleshape.tooltip.end = translate('Release mouse to finish drawing');
    L.drawLocal.draw.handlers.polygon.tooltip.start = translate('Click to start drawing shape');
    L.drawLocal.draw.handlers.polygon.tooltip.cont = translate('Click to continue drawing shape');
    L.drawLocal.draw.handlers.polygon.tooltip.end = translate('Click first point to close this shape');
    L.drawLocal.draw.handlers.marker.tooltip.start = translate('Click map to place marker');
  }

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.openStructureDataPopup = this.openStructureDataPopup.bind(this);
    this.onStructureDataPopupCancel = this.onStructureDataPopupCancel.bind(this);
    this.onStructureDataPopupSubmit = this.onStructureDataPopupSubmit.bind(this);
    this.onStructureDataPopupDelete = this.onStructureDataPopupDelete.bind(this);
    this.handleMarkerClick = this.handleMarkerClick.bind(this);
    this.state = {
      showStructureDataPopup: false,
      map: null,
      currentLayer: null,
      structureData: null,
      layersList: [],
      deletedLayersList: [],
      locateText: null,
      gazetteerGroup: null,
      invalidPoint: null,
    };
  }

  onStructureDataPopupCancel(layer, del) {
    this.setState({ showStructureDataPopup: false });
    if (del) {
      this.state.map.removeLayer(layer.layer || layer);
      const newLayersList = this.state.layersList.slice();
      const index = newLayersList.findIndex((item) => (item.layer._leaflet_id === layer._leaflet_id));
      newLayersList.splice(index, 1);
      this.setState({ layersList: newLayersList });
    }
  }

  onStructureDataPopupSubmit(layer, id, temporalId, title, structure_color, description, shape, isGazetteer) {
    this.setState({ showStructureDataPopup: false, currentLayer: null, structureData: null });
    const newLayersList = this.state.layersList.slice();
    const index = newLayersList.findIndex((item) => (item.structureData[ActivityConstants.TEMPORAL_ID] === temporalId));
    if (index > -1) {
      newLayersList.splice(index, 1);
    } else {
      temporalId = Math.random();
    }
    if (shape !== ActivityConstants.STRUCTURES_POINT && structure_color && structure_color.value) {
      layer.options.color = structure_color.value.substring(0, 7);
    }
    const newStructure = {
      layer,
      structureData: {
        id,
        [ActivityConstants.TEMPORAL_ID]: temporalId,
        title,
        structure_color,
        description,
        shape
      }
    };

    // Add extra data we need for a gazetteer point.
    if (isGazetteer) {
      newStructure.structureData[ActivityConstants.STRUCTURES_LAT] = layer.getLatLng()[ActivityConstants.STRUCTURES_LAT];
      newStructure.structureData[ActivityConstants.STRUCTURES_LNG] = layer.getLatLng()[ActivityConstants.STRUCTURES_LNG];
    }
    newLayersList.push(newStructure);
    this.setState({ layersList: newLayersList });

    if (isGazetteer) {
      // Replace gazetteer point with a regular marker.
      this.loadExistingStructure(this.state.drawnItems, newStructure.structureData, null);
      this.state.map.removeLayer(layer.layer || layer);
    }

    // Update the layer to reflect color change.
    if (shape !== ActivityConstants.STRUCTURES_POINT) {
      this.state.map.removeLayer(layer.layer || layer);
      this.state.map.addLayer(layer.layer || layer);
    }

    // Cleanup title/description if we come from an invalid point so new structures wont be created with these data.
    if (this.state.invalidPoint) {
      const auxPoint = this.state.invalidPoint;
      auxPoint[ActivityConstants.STRUCTURES_TITLE] = null;
      auxPoint[ActivityConstants.STRUCTURES_DESCRIPTION] = null;
      this.setState({ invalidPoint: auxPoint });
    }
  }

  onStructureDataPopupDelete(layer, structureData) {
    this.onStructureDataPopupCancel(layer, true);
    const newDeletedList = this.state.deletedLayersList.slice();
    newDeletedList.push({ [ActivityConstants.TEMPORAL_ID]: structureData[ActivityConstants.TEMPORAL_ID] });
    this.setState({ deletedLayersList: newDeletedList });
  }

  onLocateTextChange(control) {
    this.setState({ locateText: control.target.value });
  }

  openStructureDataPopup(e, layer, structureData) {
    this.setState({ showStructureDataPopup: true, currentLayer: layer, structureData });
  }

  handleSaveBtnClick() {
    const { onSave } = this.props;
    /* If we opened the map for an invalid point (wrong lat/lng) then we need to change the id of the first layer
    created in this map window for the original id so the list of structures is correctly updated (instead of
    creating an extra structure). */
    const auxLayersList = this.state.layersList.slice();
    if (this.state.invalidPoint && auxLayersList.length > 0) {
      auxLayersList[0].structureData[ActivityConstants.TEMPORAL_ID] = this.state.invalidPoint[ActivityConstants.TEMPORAL_ID];
    }
    onSave(auxLayersList, this.state.deletedLayersList);
    this.setState({
      layersList: [],
      deletedLayersList: [],
      locateText: null,
      gazetteerGroup: null,
      invalidPoint: null
    });
  }

  handleCancelBtnClick() {
    this.setState({
      layersList: [],
      deletedLayersList: [],
      locateText: null,
      gazetteerGroup: null,
      invalidPoint: null
    });
    this.props.onModalClose();
  }

  handleMarkerClick(event) {
    const layer = this.state.layersList.find((item) => (item.layer._leaflet_id === event.target._leaflet_id));
    this.openStructureDataPopup(event, event.target, layer.structureData);
  }

  handleGazetteerMarkerClick(event, location) {
    const structureData = {
      [ActivityConstants.STRUCTURES_SHAPE]: ActivityConstants.STRUCTURES_POINT,
      [ActivityConstants.STRUCTURES_TITLE]: location.name,
      isGazetteer: true
    };
    this.openStructureDataPopup(event, event.target, structureData);
  }

  generateMap() {
    // TODO: make these customizable or automatic from available tiles?
    const zoom = MapTilesUtils.getMaxMinZoom();
    const lat = Number(GlobalSettingsManager.getSettingByKey(GlobalSettingsConstants.GS_LATITUDE));
    const lng = Number(GlobalSettingsManager.getSettingByKey(GlobalSettingsConstants.GS_LONGITUDE));
    const cp = translate('mapCR')
      .replace('%basemap%', '<a href=\'http://openstreetmap.org/copyright\' target=\'_blank\'>OpenStreetMap</a>');
    const node = L.DomUtil.create('div', styles.map, document.getElementById('map'));
    const map = L.map(node, { zoomControl: false }).setView([lat, lng], zoom.min);
    let tilesPath = '';
    const tilesFiles = 'assets/map-tiles/{z}/{x}/{y}.png';
    tilesPath = `file://${FileManager.getAbsolutePath(tilesFiles)}`;
    L.tileLayer(tilesPath, {
      maxZoom: zoom.max,
      minZoom: zoom.min,
      attribution: cp
    }).addTo(map);
    map.addControl(new L.Control.Zoom({ zoomInTitle: translate('Zoom In'), zoomOutTitle: translate('Zoom Out') }));

    // This object groups all layers at the same time.
    const drawnItems = L.featureGroup().addTo(map);
    this.setState({ drawnItems });

    // Load point/polygon.
    this.loadExistingStructure(drawnItems, this.props.point, this.props.polygon);

    AFMapWindow.translateLeaflet();

    map.addControl(new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
        poly: {
          allowIntersection: false
        },
        remove: false,
        edit: false // Disable edit because it changes _leaflet_ids.
      },
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true
        },
        circle: false,
        circlemarker: false,
        marker: {
          icon: myIconMarker
        }
      }
    }));

    map.on(L.Draw.Event.CREATED, (event) => {
      const layer = event.layer;
      layer.on('click', (event2) => (this.handleMarkerClick(event2)));
      drawnItems.addLayer(layer);
      const structureData = {
        [ActivityConstants.STRUCTURES_TITLE]: (this.state.invalidPoint && this.state.invalidPoint[ActivityConstants.STRUCTURES_TITLE])
          ? this.state.invalidPoint[ActivityConstants.STRUCTURES_TITLE] : '',
        [ActivityConstants.STRUCTURES_COLOR]: null,
        [ActivityConstants.STRUCTURES_DESCRIPTION]: (this.state.invalidPoint && this.state.invalidPoint[ActivityConstants.STRUCTURES_DESCRIPTION])
          ? this.state.invalidPoint[ActivityConstants.STRUCTURES_DESCRIPTION] : '',
        [ActivityConstants.STRUCTURES_SHAPE]: (layer._latlng ? ActivityConstants.STRUCTURES_POINT : ActivityConstants.STRUCTURES_POLYGON),
        edit: false
      };
      this.openStructureDataPopup(layer, event, structureData);
    });

    this.setState({ map });
  }

  loadExistingStructure(drawnItems, point, polygon) {
    // Load point.
    if (point) {
      /* First check if lat/long are valid (to mimic AMP coordinates can be empty or plain wrong),
      if not save the id for later. */
      if (point[ActivityConstants.STRUCTURES_LATITUDE] === null && point[ActivityConstants.STRUCTURES_LONGITUDE] === null) {
        this.setState({
          invalidPoint: {
            id: point.id,
            [ActivityConstants.TEMPORAL_ID]: point[ActivityConstants.TEMPORAL_ID],
            [ActivityConstants.STRUCTURES_TITLE]: point[ActivityConstants.STRUCTURES_TITLE],
            [ActivityConstants.STRUCTURES_DESCRIPTION]: point[ActivityConstants.STRUCTURES_DESCRIPTION]
          },
          layersList: []
        });
      } else {
        const marker = L.marker([point[ActivityConstants.STRUCTURES_LAT], point[ActivityConstants.STRUCTURES_LNG]],
          { icon: myIconMarker });
        marker.on('click', (event) => this.handleMarkerClick(event));
        drawnItems.addLayer(marker);
        const newLayersList = this.state.layersList.slice();
        newLayersList.push({
          layer: marker,
          structureData: {
            [ActivityConstants.STRUCTURES_TITLE]: point[ActivityConstants.STRUCTURES_TITLE],
            [ActivityConstants.STRUCTURES_COLOR]: null,
            id: point.id,
            [ActivityConstants.TEMPORAL_ID]: point[ActivityConstants.TEMPORAL_ID],
            [ActivityConstants.STRUCTURES_DESCRIPTION]: point[ActivityConstants.STRUCTURES_DESCRIPTION],
            [ActivityConstants.STRUCTURES_SHAPE]: ActivityConstants.STRUCTURES_POINT,
            edit: true
          }
        });
        this.setState({ layersList: newLayersList });
      }
    } else {
      // Load polygon.
      let color = Constants.POLYGON_BASE_COLOR;
      if (polygon[ActivityConstants.STRUCTURES_COLOR]) {
        color = polygon[ActivityConstants.STRUCTURES_COLOR].value.substring(0, 7);
      }
      const newPolygon = L.polygon(polygon[ActivityConstants.STRUCTURES_COORDINATES].map(c =>
        ([c[ActivityConstants.STRUCTURES_LATITUDE], c[ActivityConstants.STRUCTURES_LONGITUDE]])), { color, opacity: OPACITY });
      newPolygon.on('click', (event) => this.handleMarkerClick(event));
      drawnItems.addLayer(newPolygon);
      const newLayersList = this.state.layersList.slice();
      newLayersList.push({
        layer: newPolygon,
        structureData: {
          [ActivityConstants.STRUCTURES_TITLE]: polygon[ActivityConstants.STRUCTURES_TITLE],
          [ActivityConstants.STRUCTURES_COLOR]: polygon[ActivityConstants.STRUCTURES_COLOR],
          id: polygon.id,
          [ActivityConstants.TEMPORAL_ID]: polygon[ActivityConstants.TEMPORAL_ID],
          [ActivityConstants.STRUCTURES_DESCRIPTION]: polygon[ActivityConstants.STRUCTURES_DESCRIPTION],
          [ActivityConstants.STRUCTURES_SHAPE]: ActivityConstants.STRUCTURES_POLYGON,
          edit: true
        }
      });
      this.setState({ layersList: newLayersList });
    }
  }

  fuzzySearch() {
    const text = this.state.locateText;
    return GazetteerHelper.findAllByNameFuzzy(text).then(data => {
      // Clean previous search.
      if (this.state.gazetteerGroup) {
        this.state.map.removeLayer(this.state.gazetteerGroup);
      }
      if (data.length > 0) {
        const gazetteerGroup = L.featureGroup().addTo(this.state.map);
        this.setState({ gazetteerGroup });
        data.forEach(l => {
          const marker = L.marker([l[ActivityConstants.STRUCTURES_LATITUDE], l[ActivityConstants.STRUCTURES_LONGITUDE]],
            { icon: circleIconMarker });
          marker.on('click', (event) => this.handleGazetteerMarkerClick(event, l));
          marker.bindTooltip(`${translate('Name')}: ${l.name} - ${translate('Lat')}: ${l[ActivityConstants.STRUCTURES_LATITUDE]} 
            - ${translate('Lng')}: ${l[ActivityConstants.STRUCTURES_LONGITUDE]}`)
            .openTooltip();
          gazetteerGroup.addLayer(marker);
        });
      }
      return data;
    });
  }

  render() {
    return (<Modal show={this.props.show} onEntered={this.generateMap.bind(this)} bsSize="large">
      <Modal.Header>
        <Modal.Title>
          {translate('Structures')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div id="map" />
        <div className={styles.gazetteer_container}>
          <input
            type="text" value={this.state.locateText} onChange={this.onLocateTextChange.bind(this)}
            className={['form-control', styles.locate_search].join(' ')} />
          <Button onClick={this.fuzzySearch.bind(this)} className={styles.locate_button}>{translate('Locate')}</Button>
        </div>
        <AFMapPopup
          show={this.state.showStructureDataPopup}
          onSubmit={this.onStructureDataPopupSubmit}
          onCancel={this.onStructureDataPopupCancel}
          onDelete={this.onStructureDataPopupDelete}
          structureData={this.state.structureData}
          layer={this.state.currentLayer} />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={this.handleSaveBtnClick.bind(this)} bsStyle="success">
          {translate('Save')}
        </Button>
        <Button onClick={this.handleCancelBtnClick.bind(this)}>
          {translate('Cancel')}
        </Button>
      </Modal.Footer>
    </Modal>);
  }
}
