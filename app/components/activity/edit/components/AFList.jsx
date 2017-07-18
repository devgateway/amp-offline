import React, { Component, PropTypes } from 'react';
import { FormControl, FormGroup, HelpBlock } from 'react-bootstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import styles from './AFList.css';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import ActivityValidator from '../../../../modules/activity/ActivityValidator';
import LoggerManager from '../../../../modules/util/LoggerManager';

/* eslint-disable class-methods-use-this */

/**
 * Activity Form list of items like Locations, Programs, etc
 * @author Nadejda Mandrescu
 */
export default class AFList extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
    activityValidator: PropTypes.instanceOf(ActivityValidator).isRequired,
  };

  static propTypes = {
    values: PropTypes.array.isRequired,
    listPath: PropTypes.string.isRequired,
    onDeleteRow: PropTypes.func,
    onEditRow: PropTypes.func
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.options = {
      onDeleteRow: this.onDeleteRow.bind(this),
      withoutNoDataText: true
    };
    this.state = {
      values: undefined,
      validationError: null
    };
  }

  componentWillMount() {
    this.listDef = this.context.activityFieldsManager.getFieldDef(this.props.listPath);
    this.fields = this.listDef.children.sort(
      (fieldA, fieldB) => {
        let res = fieldA.id_only === true ? -1 : undefined;
        res = res || (fieldB.id_only === true ? 1 : undefined);
        res = res || (fieldA.percentage === true ? -1 : undefined);
        res = res || (fieldB.percentage === true ? 1 : 0);
        return res;
      });
    this.percentageFieldDef = this.listDef.children.find(item => item.percentage === true);
    this.percentageFieldPath = this.percentageFieldDef ? `${this.props.listPath}~${this.percentageFieldDef.field_name}`
      : null;
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
      values: this.state.values.filter(item => !rows.includes(item.uniqueId))
    });
    this.props.onDeleteRow(rows);
  }

  _beforeSaveCell(row, cellName, cellValue) {
    // TODO required field validation
    if (this.percentageFieldDef && this.percentageFieldDef.field_name === cellName) {
      return this._percentageValidator(cellValue, row) === true;
    }
    return true;
  }

  _percentageValidator(cellValue) {
    return this.context.activityValidator.percentValueValidator(cellValue, this.percentageFieldPath);
  }

  _afterSaveCell(row, cellName, cellValue) {
    if (this.props.onEditRow) {
      this.props.onEditRow(row, cellName, cellValue);
    }
  }

  validate() {
    if (this.state.validationError) {
      return 'error';
    }
    return null;
  }

  columnFormatter(editable, cell) {
    // TODO we use TableHeaderColumn.columnClassName to do the same thing.
    // If won't be needed for anything else, then this method can be removed.
    if (editable) {
      return (<span className={styles.editable} >{cell}</span >);
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
    let columns = [<TableHeaderColumn key="id" dataField="uniqueId" isKey hidden />];
    columns = columns.concat(this.fields.map(childDef => {
      const childFieldName = childDef.field_name;
      const fieldPath = `${listFieldName}~${childFieldName}`;
      const editable = childDef.id_only !== true;
      const validator = childDef.percentage === true ? this._percentageValidator.bind(this) : null;
      return (
        <TableHeaderColumn
          key={childFieldName} dataField={childFieldName} columnTitle
          editable={{ readOnly: !editable, validator }} dataFormat={this.columnFormatter.bind(null, editable)} >
          {this.context.activityFieldsManager.getFieldLabelTranslation(fieldPath)}
        </TableHeaderColumn >);
    }));
    const cellEdit = {
      mode: 'click',
      blurToSave: true,
      beforeSaveCell: this._beforeSaveCell.bind(this),
      afterSaveCell: this._afterSaveCell.bind(this)
    };
    const selectRow = {
      mode: 'checkbox',
    };
    // there is no one click row removal, we'll simulate with select
    return (<div >
      <FormGroup controlId={`${this.props.listPath}-list`} validationState={this.validate()} >
        <BootstrapTable
          data={this.state.values} hover selectRow={selectRow} deleteRow options={this.options} cellEdit={cellEdit}
          containerClass={styles.containerTable} tableHeaderClass={styles.header} thClassName={styles.thClassName} >
          {columns}
        </BootstrapTable >
        <FormControl.Feedback />
        <HelpBlock >{this.state.validationError}</HelpBlock >
      </FormGroup >
    </div >);
  }

  render() {
    if (!this.context.activityFieldsManager) {
      return null;
    }

    return this.renderAsBootstrapTable();
  }
}
