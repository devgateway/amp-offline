import React, { Component, PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import styles from './AFList.css';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import * as AC from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/* eslint-disable class-methods-use-this */

// TODO remove this filter once these extra fields are no longer required at import (automatically handled by AMP)
const FIELDS_TO_IGNORE = new Set([AC.PROGRAM_SETTINGS, AC.AMP_ORGANIZATION_ROLE_ID, AC.ROLE]);

/**
 * Activity Form list of items like Locations, Programs, etc
 * @author Nadejda Mandrescu
 */
export default class AFList extends Component {
  static propTypes = {
    values: PropTypes.array.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
    listPath: PropTypes.string.isRequired,
    onDeleteRow: PropTypes.func
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.options = {
      onDeleteRow: this.onDeleteRow.bind(this),
      withoutNoDataText: true
    };
    this.state = {
      values: undefined
    };
  }

  componentWillMount() {
    this.listDef = this.props.activityFieldsManager.getFieldDef(this.props.listPath);
    this.fields = this.listDef.children.filter(child => !FIELDS_TO_IGNORE.has(child.field_name)).sort(
      (fieldA, fieldB) => {
        let res = fieldA.id_only === true ? -1 : undefined;
        res = res || (fieldB.id_only === true ? 1 : undefined);
        res = res || (fieldA.percentage === true ? -1 : undefined);
        res = res || (fieldB.percentage === true ? 1 : 0);
        return res;
      });
    this.setState({
      values: this.props.values
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      values: nextProps.values
    });
  }

  onDeleteRow(rows) {
    this.setState({
      values: this.state.values.filter(item => item.id !== rows[0])
    });
    this.props.onDeleteRow(rows);
  }

  editableCellClass(editable) {
    if (editable) {
      return styles.editable;
    }
  }

  columnFormatter(editable, cell) {
    if (editable) {
      return (<span className={styles.editable}>{cell}</span>);
    }
    return cell.toString();
  }

  /**
   * Displays AF List as a bootstrap table
   * @return {XML}
   *
   * Notes: Bootstrap table has a couple of things that are not plug and play matching AMP:
   * 1) one click row removal
   *  -> can be simulated as select click if needed
   * 2) Always visible that some fields are editable without explicitly clicking
   *  -> applied css workaround to simulate an input box for user clarity
   */
  renderAsBootstrapTable() {
    const listFieldName = this.props.listPath;
    /* in case we'll want to integrate field name as part of the table:
     <TableHeaderColumn row="0" colSpan={this.fields.length} key={listFieldName} >
     {this.props.activityFieldsManager.getFieldLabelTranslation(listFieldName)}
     </TableHeaderColumn>
     */
    let columns = [<TableHeaderColumn key="id" dataField="id" isKey hidden />];
    columns = columns.concat(this.fields.map(childDef => {
      const childFieldName = childDef.field_name;
      const fieldPath = `${listFieldName}~${childFieldName}`;
      const editable = childDef.id_only !== true;
      return (
        <TableHeaderColumn
          key={childFieldName} dataField={childFieldName}
          editable={editable} dataFormat={this.columnFormatter.bind(null, editable)}
        >
          {this.props.activityFieldsManager.getFieldLabelTranslation(fieldPath)}
        </TableHeaderColumn>);
    }));
    const cellEdit = {
      mode: 'click',
      blurToSave: true
    };
    const selectRow = {
      mode: 'checkbox',
    };
    // there is no one click row removal, we'll simulate with select
    this.table = (<BootstrapTable
      data={this.state.values} hover selectRow={selectRow} deleteRow options={this.options} cellEdit={cellEdit}
      containerClass={styles.containerTable} tableHeaderClass={styles.header} thClassName={styles.thClassName} >
      {columns}
    </BootstrapTable>);
    return (<div >
      {this.table}
    </div>);
  }

  render() {
    if (!this.props.activityFieldsManager) {
      return null;
    }

    return this.renderAsBootstrapTable();
  }
}
