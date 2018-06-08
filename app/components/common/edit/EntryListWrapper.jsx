/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'react-bootstrap';
import Logger from '../../../modules/util/LoggerManager';
import translate from '../../../utils/translate';
import * as styles from './EntryList.css';
import * as Utils from '../../../utils/Utils';
import EntryList from './EntryList';
import { LIST_MAX_SIZE } from '../../../utils/constants/FieldPathConstants';
import FieldsManager from '../../../modules/field/FieldsManager';

const logger = new Logger('EntryListWrapper');

/**
 * A base class for the EntryList wrapper for common ops
 *
 * @author Nadejda Mandrescu
 */
const EntryListWrapper = (Title, getEntryFunc, listPath) => class extends Component {
  static contextTypes = {
    activity: PropTypes.object,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager),
  };

  static propTypes = {
    items: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onEntriesChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.state = {
      uniqueIdItemPairs: this.toUniqueItemIds(props.items),
    };
  }

  componentWillMount() {
    const { activityFieldsManager } = this.context;
    if (activityFieldsManager && listPath) {
      this.fieldDef = activityFieldsManager.getFieldDef(listPath) || {};
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setUniqueItemIdsAndUpdateState(nextProps.items);
  }

  onAdd() {
    const items = this.getItems();
    items.push({});
    // special behavior used by Contact Email/Phone/Fax: report validation error, but do not add new entry
    this.props.onChange(items);
    if (this.fieldDef[LIST_MAX_SIZE] && this.fieldDef[LIST_MAX_SIZE] < items.length) {
      items.pop();
    }
    this.props.onEntriesChange(items);
    this.setUniqueItemIdsAndUpdateState(items);
  }

  onRemove(uniqueId) {
    let { uniqueIdItemPairs } = this.state;
    uniqueIdItemPairs = uniqueIdItemPairs.filter(([uId]) => uId !== uniqueId);
    const items = this.getItems(uniqueIdItemPairs);
    this.props.onChange(items);
    this.props.onEntriesChange(items);
    // this.setUniqueItemIdsAndUpdateState(items);
  }

  setUniqueItemIdsAndUpdateState(items) {
    this.setState({ uniqueIdItemPairs: this.toUniqueItemIds(items) });
  }

  toUniqueItemIds(items) {
    return items.map(item => ([Utils.stringToUniqueId('item'), item]));
  }

  getItems(uniqueIdItemPairs = this.state.uniqueIdItemPairs) {
    return uniqueIdItemPairs.map(([, item]) => item);
  }

  render() {
    const { uniqueIdItemPairs } = this.state;
    if (!uniqueIdItemPairs) {
      return null;
    }
    const ids = uniqueIdItemPairs.map(([uId]) => uId);

    return (
      <Grid>
        <EntryList
          label={translate(Title)} className={styles.wrapperContainer}
          onRemove={this.onRemove.bind(this)} onAdd={this.onAdd.bind(this)} childrenIds={ids}>
          {uniqueIdItemPairs.map(([uid, item]) => getEntryFunc(uid, item))}
        </EntryList>
      </Grid>
    );
  }
};

export default EntryListWrapper;
