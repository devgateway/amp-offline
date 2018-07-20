/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import L from 'leaflet';
import LD from 'leaflet-draw';
import path from 'path';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import styles from './AFMapWindow.css';
import GlobalSettingsManager from '../../../../../modules/util/GlobalSettingsManager';
import * as GSC from '../../../../../utils/constants/GlobalSettingsConstants';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import FileManager from '../../../../../modules/util/FileManager';
import { MAP_MARKER_IMAGE, MAP_MARKER_SHADOW, POLYGON_BASE_COLOR } from '../../../../../utils/Constants';
import AFMapPopup from './AFMapPopup';

const logger = new Logger('Map Modal');
const myIcon = L.icon({
  iconUrl: MAP_MARKER_IMAGE,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [-3, -76],
  shadowUrl: MAP_MARKER_SHADOW
});

/**
 * Map Modal
 *
 * @author Gabriel Inchauspe
 */
export default class AFMapWindow extends Component {
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
    logger.log('constructor');
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
      deletedLayersList: []
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

  onStructureDataPopupSubmit(layer, id, title, structures_color, description, shape) {
    this.setState({ showStructureDataPopup: false, currentLayer: null, structureData: null });
    const newLayersList = this.state.layersList.slice();
    const index = newLayersList.findIndex((item) => (item.structureData.id === id));
    if (index > -1) {
      newLayersList.splice(index, 1);
    } else {
      id = Math.random();
    }
    const newLayer = { layer, structureData: { title, structures_color, id, description, shape } };
    newLayersList.push(newLayer);
    this.setState({ layersList: newLayersList });
  }

  onStructureDataPopupDelete(layer, structureData) {
    this.onStructureDataPopupCancel(layer, true);
    const newDeletedList = this.state.deletedLayersList.slice();
    newDeletedList.push({ id: structureData.id });
    this.setState({ deletedLayersList: newDeletedList });
  }

  openStructureDataPopup(e, layer, structureData) {
    this.setState({ showStructureDataPopup: true, currentLayer: layer, structureData });
  }

  handleSaveBtnClick() {
    const { onSave } = this.props;
    onSave(this.state.layersList, this.state.deletedLayersList);
    this.setState({ layersList: [], deletedLayersList: [] });
  }

  handleCancelBtnClick() {
    this.setState({ layersList: [], deletedLayersList: [] });
    this.props.onModalClose();
  }

  handleMarkerClick(event) {
    const layer = this.state.layersList.find((item) => (item.layer._leaflet_id === event.target._leaflet_id));
    this.openStructureDataPopup(event, event.target, layer.structureData);
  }

  generateMap() {
    // TODO: make these customizable or automatic from available tiles?
    const minZoom = 8;
    const maxZoom = 11;
    const lat = Number(GlobalSettingsManager.getSettingByKey(GSC.GS_LATITUDE));
    const lng = Number(GlobalSettingsManager.getSettingByKey(GSC.GS_LONGITUDE));
    const cp = translate('mapCR')
      .replace('%basemap%', '<a href=\'http://openstreetmap.org/copyright\' target=\'_blank\'>OpenStreetMap</a>');
    const node = L.DomUtil.create('div', styles.map, document.getElementById('map'));
    const map = L.map(node, { zoomControl: false }).setView([lat, lng], minZoom);
    let tilesPath = '';
    const tilesFiles = 'assets/map-tiles/{z}/{x}/{y}.png';
    if (process.env.NODE_ENV === 'production') {
      tilesPath = `file://${path.join(FileManager.getDataPath(), tilesFiles)}`;
    } else {
      // TODO: After the code for Resources is merged, use a function from FileManager for development too.
      tilesPath = `file://${global.__dirname}/../${tilesFiles}`;
    }
    L.tileLayer(tilesPath, {
      maxZoom,
      minZoom,
      attribution: cp
    }).addTo(map);
    map.addControl(new L.Control.Zoom({ zoomInTitle: translate('Zoom In'), zoomOutTitle: translate('Zoom Out') }));

    // This object groups all layers at the same time.
    const drawnItems = L.featureGroup().addTo(map);

    // Load point/polygon.
    this.loadExistingStructure(drawnItems);

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
          icon: myIcon
        }
      }
    }));

    map.on(L.Draw.Event.CREATED, (event) => {
      const layer = event.layer;
      layer.on('click', (event2) => (this.handleMarkerClick(event2)));
      drawnItems.addLayer(layer);
      const structureData = {
        [AC.STRUCTURES_TITLE]: '',
        [AC.STRUCTURES_COLOR]: null,
        [AC.STRUCTURES_DESCRIPTION]: '',
        [AC.STRUCTURES_SHAPE]: (layer._latlng ? AC.STRUCTURES_POINT : AC.STRUCTURES_POLYGON),
        edit: false
      };
      this.openStructureDataPopup(layer, event, structureData);
    });

    this.setState({ map });
  }

  loadExistingStructure(drawnItems) {
    if (this.props.point || this.props.polygon) {
      // Load point.
      if (this.props.point) {
        const marker = L.marker([this.props.point[AC.STRUCTURES_LAT], this.props.point[AC.STRUCTURES_LNG]],
          { icon: myIcon });
        marker.on('click', (event) => this.handleMarkerClick(event));
        drawnItems.addLayer(marker);
        const newLayersList = this.state.layersList.slice();
        newLayersList.push({
          layer: marker,
          structureData: {
            [AC.STRUCTURES_TITLE]: this.props.point[AC.STRUCTURES_TITLE],
            [AC.STRUCTURES_COLOR]: null,
            id: this.props.point.id,
            [AC.STRUCTURES_DESCRIPTION]: this.props.point[AC.STRUCTURES_DESCRIPTION],
            [AC.STRUCTURES_SHAPE]: AC.STRUCTURES_POINT,
            edit: true
          }
        });
        this.setState({ layersList: newLayersList });
      } else {
        // Load polygon.
        let color = POLYGON_BASE_COLOR;
        if (this.props.polygon[AC.STRUCTURES_COLOR]) {
          color = this.props.polygon[AC.STRUCTURES_COLOR].value.substring(0, 7);
        }
        const polygon = L.polygon(this.props.polygon[AC.STRUCTURES_COORDINATES].map(c =>
          ([c[AC.STRUCTURES_LATITUDE], c[AC.STRUCTURES_LONGITUDE]])), { color, opacity: '0.5' });
        polygon.on('click', (event) => this.handleMarkerClick(event));
        drawnItems.addLayer(polygon);
        const newLayersList = this.state.layersList.slice();
        newLayersList.push({
          layer: polygon,
          structureData: {
            [AC.STRUCTURES_TITLE]: this.props.polygon[AC.STRUCTURES_TITLE],
            [AC.STRUCTURES_COLOR]: this.props.polygon[AC.STRUCTURES_COLOR],
            id: this.props.polygon.id,
            [AC.STRUCTURES_DESCRIPTION]: this.props.polygon[AC.STRUCTURES_DESCRIPTION],
            [AC.STRUCTURES_SHAPE]: AC.STRUCTURES_POLYGON,
            edit: true
          }
        });
        this.setState({ layersList: newLayersList });
      }
    } else {
      // This is "Add Structure" case.
      this.setState({ layersList: [] });
    }
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
