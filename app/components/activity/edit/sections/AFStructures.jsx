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
    content.push(<Col md={3} lg={3}>
      <AFField fieldPath={`${AC.STRUCTURES}~${AC.STRUCTURES_TITLE}`} parent={structure} type={Types.TEXT_AREA} />
    </Col>);
    content.push(<Col md={3} lg={3}>
      <AFField fieldPath={`${AC.STRUCTURES}~${AC.STRUCTURES_DESCRIPTION}`} parent={structure} type={Types.TEXT_AREA} />
    </Col>);
    content.push(<Col md={3} lg={3}>
      <AFField
        fieldPath={`${AC.STRUCTURES}~${AC.STRUCTURES_LATITUDE}`} parent={structure} type={Types.NUMBER}
        extraParams={{ readonly: true }} />
    </Col>);
    content.push(<Col md={3} lg={3}>
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
    this.handleMap = this.handleMap.bind(this);
    this.handleView = this.handleView.bind(this);
    this.state = { structures: props.activity[AC.STRUCTURES] || [] };
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
      <Button bsStyle="primary" onClick={this.handleMap.bind(this, structure)}>{translate('Map')}</Button>
      {structure[AC.STRUCTURES_SHAPE] === AC.STRUCTURES_POLYGON ?
        <Button bsStyle="primary" onClick={this.handleView.bind(this, structure)}>{translate('View')}</Button>
        : null}
      <Button bsStyle="danger" onClick={this.handleDelete.bind(this, structure, i)}>{translate('Delete')}</Button>
    </Col>);
  }

  handleView(structure) {
    debugger;
  }

  handleMap(structure) {
    // TODO: To be implemented.
  }

  handleDelete(structure, i) {
    const newStructures = this.state.structures.slice();
    newStructures.splice(i, 1);
    this.setState({ structures: newStructures });
  }

  render() {
    this.preProcessForIds();
    return (<div className={afStyles.full_width}>
      <Grid className={afStyles.full_width}>
        {this.state.structures.map((s, i) => (
          <Panel header={translate('Structure')}>
            <Row>{AFStructures.generateDataRow(s)}</Row>
            <Row>{this.generateButtonRow(s, i)}</Row>
          </Panel>))}
      </Grid>
    </div>);
  }
}

export default AFSection(AFStructures, STRUCTURES);
