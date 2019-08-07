/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { Button, Panel } from 'react-bootstrap';
import { ActivityConstants } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import FieldsManager from '../../../../../modules/field/FieldsManager';
import translate from '../../../../../utils/translate';
import afStyles from '../../ActivityForm.css';
import fundingStyles from './AFFundingContainer.css';
import AFMTEFProjectionItem from './AFMTEFProjectionItem';
import * as Utils from '../../../../../utils/Utils';
import FeatureManager from '../../../../../modules/util/FeatureManager';
import * as FMC from '../../../../../utils/constants/FeatureManagerConstants';

const logger = new Logger('AF MTEF container');

/**
 * @author Gabriel Inchauspe
 */
export default class AFMTEFProjectionContainer extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired
  };

  static propTypes = {
    mtefProjections: PropTypes.array.isRequired,
    hasErrors: PropTypes.func.isRequired,
    handleNewItem: PropTypes.func.isRequired,
    handleRemoveItem: PropTypes.func.isRequired,
    funding: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    const errors = this.props.hasErrors(props.mtefProjections);
    this.state = {
      errors,
      refresh: 0
    };
    if (errors) {
      props.funding.mtefSectionOpen = true;
    }
    this._onChildUpdate = this._onChildUpdate.bind(this);
  }

  _onChildUpdate() {
    const errors = this.props.hasErrors(this.props.mtefProjections);
    this.setState({ errors });
  }

  render() {
    if (FeatureManager.isFMSettingEnabled(FMC.MTEF_PROJECTIONS)) {
      const { mtefProjections, handleRemoveItem, handleNewItem } = this.props;
      const hasErrors = this.props.hasErrors(mtefProjections);
      const open = this.props.funding.mtefSectionOpen;
      return (<div className={afStyles.full_width}>
        <Panel
          header={translate('MTEF Projections')} collapsible expanded={open}
          onSelect={() => {
            this.props.funding.mtefSectionOpen = !open;
            this.setState({ refresh: Math.random() });
          }} className={hasErrors ? fundingStyles.error : ''}>
          {mtefProjections.map((mtef) => {
            // Add a temporal_id field so we can delete items.
            if (!mtef[ActivityConstants.TEMPORAL_ID]) {
              mtef[ActivityConstants.TEMPORAL_ID] = Utils.numberRandom();
            }
            return (<AFMTEFProjectionItem
              mtefItem={mtef} removeMTEFItem={handleRemoveItem} key={mtef[ActivityConstants.TEMPORAL_ID]}
              updateParentErrors={this._onChildUpdate} />);
          })}
          <Button bsStyle="primary" onClick={handleNewItem}>{translate('Add Projection')}</Button>
        </Panel>
      </div>);
    } else {
      return null;
    }
  }
}
