/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { Button, Panel } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import Logger from '../../../../../modules/util/LoggerManager';
import FieldsManager from '../../../../../modules/field/FieldsManager';
import translate from '../../../../../utils/translate';
import afStyles from '../../ActivityForm.css';
import fundingStyles from './AFFundingContainer.css';
import AFMTEFProjectionItem from './AFMTEFProjectionItem';
import * as Utils from '../../../../../utils/Utils';

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
    logger.log('constructor');
    this.state = {
      openMTEF: false
    };
  }

  componentWillReceiveProps(nextProps) {
    // Expand the section that has errors.
    if (this.props.hasErrors(nextProps.funding)) {
      this.setState({ openMTEF: true });
    }
  }

  render() {
    const { mtefProjections, handleRemoveItem, funding, handleNewItem } = this.props;
    const hasErrors = this.props.hasErrors(funding);
    return (<div className={afStyles.full_width}>
      <Panel
        header={translate('MTEF Projections')} collapsible expanded={this.state.openMTEF}
        onSelect={() => {
          this.setState({ openMTEF: !this.state.openMTEF });
        }} className={hasErrors ? fundingStyles.error : ''}>
        {mtefProjections.map((mtef) => {
          // Add a temporal_id field so we can delete items.
          if (!mtef[AC.TEMPORAL_ID]) {
            mtef[AC.TEMPORAL_ID] = Utils.numberRandom();
          }
          return <AFMTEFProjectionItem mtefItem={mtef} removeMTEFItem={handleRemoveItem} key={Math.random()} />;
        })}
        <Button bsStyle="primary" onClick={handleNewItem}>{translate('Add Projection')}</Button>
      </Panel>
    </div>);
  }
}
