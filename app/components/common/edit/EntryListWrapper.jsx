import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'react-bootstrap';
import Logger from '../../../modules/util/LoggerManager';
import translate from '../../../utils/translate';
import * as styles from './EntryList.css';
import * as Utils from '../../../utils/Utils';
import EntryList from './EntryList';

const logger = new Logger('EntryListWrapper');

/**
 * A base class for the EntryList wrapper for common ops
 *
 * @author Nadejda Mandrescu
 */
const EntryListWrapper = (Title, getEntryFunc) => class extends Component {
  static propTypes = {
    items: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.state = {
      uniqueIdItemPairs: null,
    };
    this.setUniqueItemIdsAndUpdateState(props.items);
  }

  componentWillReceiveProps(nextProps) {
    this.setUniqueItemIdsAndUpdateState(nextProps.items);
  }

  onAdd() {
    const items = this.getItems();
    items.push({});
    this.setUniqueItemIdsAndUpdateState(items);
  }

  onRemove(uniqueId) {
    let { uniqueIdItemPairs } = this.state;
    uniqueIdItemPairs = uniqueIdItemPairs.filter(([uId]) => uId !== uniqueId);
    this.setState({ uniqueIdItemPairs });
  }

  setUniqueItemIdsAndUpdateState(items) {
    if (!items) {
      return;
    }
    const uniqueIdItemPairs = items.map(item => ([Utils.stringToUniqueId('item'), item]));
    this.setState({ uniqueIdItemPairs });
  }

  getItems() {
    return this.state.uniqueIdItemPairs.map(([, item]) => item);
  }

  render() {
    const { uniqueIdItemPairs } = this.state;
    if (!uniqueIdItemPairs) {
      return null;
    }
    const items = this.getItems();
    const ids = uniqueIdItemPairs.map(([uId]) => uId);

    return (
      <Grid>
        <EntryList
          label={translate(Title)} className={styles.wrapperContainer}
          onRemove={this.onRemove.bind(this)} onAdd={this.onAdd.bind(this)} childrenIds={ids}>
          {items.map(getEntryFunc)}
        </EntryList>
      </Grid>
    );
  }
};

export default EntryListWrapper;
