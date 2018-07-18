import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import L from 'leaflet';
import path from 'path';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import styles from './AFMapWindow.css';
import GlobalSettingsManager from '../../../../../modules/util/GlobalSettingsManager';
import * as GSC from '../../../../../utils/constants/GlobalSettingsConstants';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import FileManager from '../../../../../modules/util/FileManager';
import { MAP_MARKER_IMAGE } from '../../../../../utils/Constants';

const logger = new Logger('Map Modal');
// const esri = require('esri-leaflet');
const popup = L.popup();

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
    polygon: PropTypes.array
  };

  static onMapClick(map, e) {
    popup
      .setLatLng(e.latlng)
      .setContent(`You clicked the map at '${e.latlng.toString()}`)
      .openOn(map);
  }

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.state = {};
  }

  handleSaveBtnClick() {
    const { onSave } = this.props;
    onSave();
  }

  handleChange(url) {
    this.setState({ url });
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
    const map = L.map(node).setView([lat, lng], minZoom);

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
    map.on('click', AFMapWindow.onMapClick.bind(null, map));

    // Load point.
    if (this.props.point) {
      const myIcon = L.icon({
        iconUrl: MAP_MARKER_IMAGE,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [-3, -76]
      });
      L.marker([this.props.point[AC.STRUCTURES_LAT], this.props.point[AC.STRUCTURES_LNG]], { icon: myIcon }).addTo(map);
    }

    // Load polygon.
    if (this.props.polygon) {
      L.polygon(this.props.polygon.map(c => ([c[AC.STRUCTURES_LATITUDE], c[AC.STRUCTURES_LONGITUDE]]))).addTo(map);
    }
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
