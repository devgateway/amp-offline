import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Grid, Panel, Row, Button } from 'react-bootstrap';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { STRUCTURES } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import Logger from '../../../../modules/util/LoggerManager';
import afStyles from '../ActivityForm.css';
import * as Types from '../components/AFComponentTypes';
import translate from '../../../../utils/translate';
import AFViewStructure from './structures/AFViewStructure';
import AFMapWindow from './structures/AFMapWindow';

const logger = new Logger('AF Structures');

/**
 * Organizations Section
 * @author Gabriel Inchauspe
 */
class AFStructures extends Component {

  static contextTypes = {
    activity: PropTypes.object.isRequired
  };

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  static generateDataRow(structure) {
    const content = [];
    content.push(<Col md={3} lg={3} key={Math.random()}>
      <AFField fieldPath={`${AC.STRUCTURES}~${AC.STRUCTURES_TITLE}`} parent={structure} type={Types.TEXT_AREA} />
    </Col>);
    content.push(<Col md={3} lg={3} key={Math.random()}>
      <AFField fieldPath={`${AC.STRUCTURES}~${AC.STRUCTURES_DESCRIPTION}`} parent={structure} type={Types.TEXT_AREA} />
    </Col>);
    content.push(<Col md={3} lg={3} key={Math.random()}>
      <AFField
        fieldPath={`${AC.STRUCTURES}~${AC.STRUCTURES_LATITUDE}`} parent={structure} type={Types.NUMBER}
        extraParams={{ readonly: true }} />
    </Col>);
    content.push(<Col md={3} lg={3} key={Math.random()}>
      <AFField
        fieldPath={`${AC.STRUCTURES}~${AC.STRUCTURES_LONGITUDE}`} parent={structure} type={Types.NUMBER}
        extraParams={{ readonly: true }} />
    </Col>);
    return content;
  }

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.handleDelete = this.handleDelete.bind(this);
    this.openMap = this.openMap.bind(this);
    this.handleViewCoordinates = this.handleViewCoordinates.bind(this);
    this.handleSaveMap = this.handleSaveMap.bind(this);
    this.handleCloseMap = this.handleCloseMap.bind(this);
    this.state = {
      structures: props.activity[AC.STRUCTURES] || [],
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
        if (!s.id) {
          s.id = Math.random();
        }
      });
    }
  }

  generateButtonRow(structure, i) {
    return (<Col md={12} lg={12}>
      <Button
        bsStyle="primary" className={afStyles.button}
        onClick={this.openMap.bind(this, structure)}>{translate('Map')}
      </Button>
      {structure[AC.STRUCTURES_SHAPE] === AC.STRUCTURES_POLYGON ? <Button
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
    if (structure[AC.STRUCTURES_SHAPE] === AC.STRUCTURES_POINT) {
      this.setState({
        showMapDialog: true,
        viewStructure: structure,
        currentPoint: {
          id: structure.id,
          [AC.STRUCTURES_TITLE]: structure[AC.STRUCTURES_TITLE],
          [AC.STRUCTURES_LAT]: structure[AC.STRUCTURES_LATITUDE],
          [AC.STRUCTURES_LNG]: structure[AC.STRUCTURES_LONGITUDE],
          [AC.STRUCTURES_DESCRIPTION]: structure[AC.STRUCTURES_DESCRIPTION]
        },
        currentPolygon: null
      });
    } else {
      this.setState({
        showMapDialog: true,
        viewStructure: structure,
        currentPolygon: {
          [AC.STRUCTURES_COORDINATES]: structure[AC.STRUCTURES_COORDINATES],
          id: structure.id,
          [AC.STRUCTURES_TITLE]: structure[AC.STRUCTURES_TITLE],
          [AC.STRUCTURES_DESCRIPTION]: structure[AC.STRUCTURES_DESCRIPTION]
        },
        currentPoint: null
      });
    }
  }

  handleDelete(structure, i) {
    const newStructures = this.state.structures.slice();
    newStructures.splice(i, 1);
    this.setState({ structures: newStructures });
    this.context.activity[AC.STRUCTURES] = newStructures;
  }

  handleCloseMap() {
    this.setState({ showMapDialog: false });
  }

  handleSaveMap(layersList) {
    const newStructures = this.state.structures.slice();
    layersList.forEach(l => {
      const index = newStructures.findIndex(s => (s.id === l.structureData.id));
      if (index > -1) {
        newStructures.splice(index, 1);
      }
      // TODO: diferenciar entre punto y poligono.
      newStructures.push({
        [AC.STRUCTURES_TITLE]: l.structureData[AC.STRUCTURES_TITLE],
        [AC.STRUCTURES_DESCRIPTION]: l.structureData[AC.STRUCTURES_DESCRIPTION],
        [AC.STRUCTURES_LATITUDE]: l.layer.getLatLng()[AC.STRUCTURES_LAT],
        [AC.STRUCTURES_LONGITUDE]: l.layer.getLatLng()[AC.STRUCTURES_LNG],
        [AC.STRUCTURES_SHAPE]: AC.STRUCTURES_POINT,
        [AC.STRUCTURES_COORDINATES]: [],
        id: l.structureData.id || Math.random()
      });
    });
    this.setState({ structures: newStructures, showMapDialog: false });
  }

  render() {
    this.preProcessForIds();
    return (<div className={afStyles.full_width}>

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
        {this.state.structures.map((s, i) => (
          <Panel key={Math.random()} header={translate('Structure')}>
            <Row>{AFStructures.generateDataRow(s)}</Row>
            <Row>{this.generateButtonRow(s, i)}</Row>
          </Panel>))}
      </Grid>
    </div>);
  }
}

export default AFSection(AFStructures, STRUCTURES);
