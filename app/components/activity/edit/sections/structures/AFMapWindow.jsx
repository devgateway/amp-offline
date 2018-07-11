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
import { MAP_MARKER_IMAGE } from '../../../../../utils/Constants';
import AFMapPopup from './AFMapPopup';

const logger = new Logger('Map Modal');
const myIcon = L.icon({
  iconUrl: MAP_MARKER_IMAGE,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [-3, -76]
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
    polygon: PropTypes.array,
    structures: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.openStructureDataPopup = this.openStructureDataPopup.bind(this);
    this.onStructureDataPopupCancel = this.onStructureDataPopupCancel.bind(this);
    this.onStructureDataPopupSubmit = this.onStructureDataPopupSubmit.bind(this);
    this.handleMarkerClick = this.handleMarkerClick.bind(this);
    this.state = {
      showStructureDataPopup: false,
      map: null,
      currentLayer: null,
      structureData: null,
      layersList: []
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

  onStructureDataPopupSubmit(layer, title, color) {
    this.setState({ showStructureDataPopup: false, currentLayer: null, structureData: null });
    const newLayersList = this.state.layersList.slice();
    const index = newLayersList.findIndex((item) => (item.layer._leaflet_id === layer._leaflet_id));
    if (index > -1) {
      newLayersList.splice(index, 1);
    }
    const newLayer = { layer, structureData: { title, color } };
    newLayersList.push(newLayer);
    this.setState({ layersList: newLayersList });
  }

  openStructureDataPopup(e, layer, structureData) {
    /* Note: If we want to use leaflet's popup with a React component as content then we need to add react-leaflet
    * lib and convert the current js map definition (leaflet) to React components: https://react-leaflet.js.org */
    this.setState({ showStructureDataPopup: true, currentLayer: layer, structureData });
  }

  handleSaveBtnClick() {
    const { onSave } = this.props;
    onSave();
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
    const cp = 'Map data &copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    const node = L.DomUtil.create('div', styles.map, document.getElementById('map'));
    const map = L.map(node).setView([lat, lng], minZoom);
    let tilesPath = '';
    const tilesFiles = 'assets/map-tiles/{z}/{x}/{y}.png';
    if (process.env.NODE_ENV === 'production') {
      tilesPath = `file://${path.join(FileManager.getDataPath(), tilesFiles)}`;
    } else {
      tilesPath = `file://${global.__dirname}/../${tilesFiles}`;
    }
    L.tileLayer(tilesPath, {
      maxZoom,
      minZoom,
      attribution: cp
    }).addTo(map);

    // This object groups all layers at the same time.
    const drawnItems = L.featureGroup().addTo(map);

    // Load point.
    if (this.props.point) {
      const marker = L.marker([this.props.point[AC.STRUCTURES_LAT], this.props.point[AC.STRUCTURES_LNG]],
        { icon: myIcon });
      marker.on('click', (event) => this.handleMarkerClick(event));
      drawnItems.addLayer(marker);
      const newLayersList = this.state.layersList.slice();
      newLayersList.push({
        layer: marker,
        structureData: { title: this.props.point[AC.STRUCTURES_TITLE], color: null }
      });
      this.setState({ layersList: newLayersList });
    }

    // Load polygon.
    if (this.props.polygon) {
      const poli = L.polygon(this.props.polygon.map(c => ([c[AC.STRUCTURES_LATITUDE], c[AC.STRUCTURES_LONGITUDE]])));
      poli.on('click', (event) => this.handleMarkerClick(event));
      drawnItems.addLayer(poli);
      // TODO: Implement above code from point.
    }

    // Setup controls.
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
      const structureData = { title: '', color: null };
      this.openStructureDataPopup(layer, event, structureData);
    });

    this.setState({ map });
  }

  render() {
    const { onModalClose } = this.props;
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
          structureData={this.state.structureData}
          layer={this.state.currentLayer} />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={this.handleSaveBtnClick.bind(this)} bsStyle="success">
          {translate('Save')}
        </Button>
        <Button onClick={onModalClose}>
          {translate('Cancel')}
        </Button>
      </Modal.Footer>
    </Modal>);
  }
}
