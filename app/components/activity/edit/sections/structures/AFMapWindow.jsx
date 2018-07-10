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
    polygon: PropTypes.array
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.onMapClick = this.onMapClick.bind(this);
    this.onStructureDataPopupCancel = this.onStructureDataPopupCancel.bind(this);
    this.state = {
      showStructureDataPopup: false,
      structureDataPopupCoordinates: null,
      map: null
    };
  }

  onMapClick(e) {
    /* Note: If we want to use leaflet's popup with a React component as content then we need to add react-leaflet
    * lib and convert the current js map definition (leaflet) to React components: https://react-leaflet.js.org */
    // TODO: Mostrar el componente popup modal.
    this.setState({ showStructureDataPopup: true, structureDataPopupCoordinates: e.latlng });
    L.marker(e.latlng, { icon: myIcon }).addTo(this.state.map);
  }

  onStructureDataPopupCancel(e, latlng) {
    this.setState({ showStructureDataPopup: false });
    this.state.map.removeLayer(latlng); // TODO: necesito el latlng aca.
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
    map.on('click', this.onMapClick);

    // Load point.
    if (this.props.point) {
      L.marker([this.props.point[AC.STRUCTURES_LAT], this.props.point[AC.STRUCTURES_LNG]], { icon: myIcon })
        .addTo(map);
    }

    // Load polygon.
    if (this.props.polygon) {
      L.polygon(this.props.polygon.map(c => ([c[AC.STRUCTURES_LATITUDE], c[AC.STRUCTURES_LONGITUDE]])))
        .addTo(map);
    }

    // Setup controls.
    const drawnItems = L.featureGroup().addTo(map);
    map.addControl(new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
        poly: {
          allowIntersection: false
        }
      },
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true
        },
        circle: false
      }
    }));
    map.on(L.Draw.Event.CREATED, (event) => {
      const layer = event.layer;
      layer.on('contextmenu', (e) => {
        e.layerz = layer;
        /* selectedPointEvent = e;
        isMenuOpen = true;
        const y = e.originalEvent.clientY;
        const x = e.originalEvent.clientX; */
        // this.showMenu(y, x);
      });
      drawnItems.addLayer(layer);
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
          show={this.state.showStructureDataPopup} onSubmit={() => (alert('submit'))}
          onCancel={this.onStructureDataPopupCancel} />
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
