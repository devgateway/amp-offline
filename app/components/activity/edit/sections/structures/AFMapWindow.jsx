import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import L from 'leaflet';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import styles from './AFMapWindow.css';

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
    show: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.state = {
      validationResult: undefined
    };
  }

  onMapClick(map, e) {
    popup
      .setLatLng(e.latlng)
      .setContent(`You clicked the map at '${e.latlng.toString()}`)
      .openOn(map);
  }

  handleSaveBtnClick() {
    const { onSave } = this.props;
    onSave();
  }

  handleChange(url) {
    this.setState({ url });
  }

  generateMap() {
    const node = L.DomUtil.create('div', styles.map, document.getElementById('map'));
    const map = L.map(node).setView([18.8628921578, -72.770007622], 8);
    L.tileLayer(`file://${global.__dirname}/../assets/map-tiles/{z}/{x}/{y}.png`, {
      maxZoom: 11,
      minZoom: 8,
      attribution: 'Map data &copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    map.on('click', this.onMapClick.bind(null, map));
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
        <div id="map">
          mapa
        </div>
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
