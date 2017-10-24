import React, { Component, PropTypes } from 'react';
import { FormControl, FormGroup, HelpBlock } from 'react-bootstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import styles from './AFList.css';
import afStyles from '../ActivityForm.css';
import { LABEL } from './AFComponentTypes';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import ActivityValidator from '../../../../modules/activity/ActivityValidator';
import Logger from '../../../../modules/util/LoggerManager';
import AFField from './AFField';

const logger = new Logger('AF List');

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
    onEditRow: PropTypes.func,
    language: PropTypes.string // Needed to update header translations.
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.options = {
      onDeleteRow: this.onDeleteRow.bind(this),
      withoutNoDataText: true
    };
    this.state = {
      values: undefined,
      validationError: null,
      language: null
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
      values: this.props.values,
      language: this.props.language
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      values: nextProps.values,
      language: nextProps.language
    });
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.values !== this.props.values || nextProps.language !== this.props.language;
  }

  onDeleteRow(uniqueId) {
    this.setState({
      values: this.state.values.filter(item => uniqueId !== item.uniqueId)
    });
    this.props.onDeleteRow(uniqueId);
  }

  getCellClass(editable, required) {
    const cellClasses = [];
    if (editable) {
      cellClasses.push(styles.editable);
      if (required) {
        cellClasses.push(afStyles.required);
      }
    }
    return cellClasses.length ? cellClasses.join(' ') : null;
  }

  getCustomEditor(fieldPath, onUpdate, props) {
    return <AFField onUpdate={onUpdate} fieldPath={fieldPath} parent={props.row} showLabel={false} {...props} />;
  }

  getDataFormat(editable, fieldPath, cell, row) {
    if (editable) {
      return <AFField fieldPath={fieldPath} parent={row} showLabel={false} />;
    }
    return cell;
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
    if (editable) {
      return (<span className={styles.editable} >{cell}</span>);
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
      const required = childDef.required !== 'N';
      const validator = childDef.percentage === true ? this._percentageValidator.bind(this) : null;
      return (
        <TableHeaderColumn
          key={childFieldName} dataField={childFieldName} columnTitle editable={{ readOnly: !editable, validator }}
          dataFormat={this.getDataFormat.bind(this, editable, fieldPath)}
          customEditor={{ getElement: this.getCustomEditor.bind(this, fieldPath) }}
          columnClassName={this.getCellClass.bind(this, editable, required)} >
          {this.context.activityFieldsManager.getFieldLabelTranslation(fieldPath)}
        </TableHeaderColumn>);
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
    return (<div>
      <FormGroup controlId={`${this.props.listPath}-list`} validationState={this.validate()} >
        <BootstrapTable
          data={this.state.values} hover selectRow={selectRow} deleteRow options={this.options} cellEdit={cellEdit}
          containerClass={styles.containerTable} tableHeaderClass={styles.header} thClassName={styles.thClassName} >
          {columns}
        </BootstrapTable>
        <FormControl.Feedback />
        <HelpBlock>{this.state.validationError}</HelpBlock>
      </FormGroup>
    </div>);
  }

  renderAsSimpleTable() {
    const { listPath } = this.props;
    const headers = [];
    const content = [];
    const collWidth = { width: 90 / this.fields.length };
    this.fields.forEach(childDef => {
      const childFieldName = childDef.field_name;
      const fieldPath = `${listPath}~${childFieldName}`;
      const editable = childDef.id_only !== true;
      const fieldType = editable ? null : LABEL;
      const className = editable ? styles.cell_editable : styles.cell_readonly;

      headers.push(this.context.activityFieldsManager.getFieldLabelTranslation(fieldPath));
      let rowId = 0;
      this.state.values.forEach(rowData => {
        if (rowId === content.length) {
          content.push({ rowData, cells: [] });
        }
        const key = (rowData[childFieldName] && rowData[childFieldName].uniqueId)
          || rowData[childFieldName] || Math.random();
        const value = (<AFField
          fieldPath={fieldPath} parent={rowData} type={fieldType} showLabel={false} className={className} inline
          showRequired={editable} onAfterUpdate={this._afterSaveCell.bind(this, rowData, childFieldName)} />);
        content[rowId].cells.push({ key, value });
        rowId += 1;
      });
    });
    return (
      <div className="react-bs-table react-bs-table-bordered" >
        <table className="table table-bordered table-hover" >
          <tbody className="react-bs-container-body" >
            <tr >
              {headers.map(header =>
                (<th className={styles.thClassName} style={collWidth} key={header} >{header}</th >))}
              <th className={`${styles.thDelete} ${styles.thClassName}`} />
            </tr >
            {content.map(row => (
              <tr key={row.rowData.uniqueId}>
                {row.cells.map(cell => (
                  <td key={cell.key} className={styles.cell} >{cell.value}</td >
                ))}
                <td className={styles.thDelete} >
                  <a
                    onClick={this.onDeleteRow.bind(this, row.rowData.uniqueId)} className={styles.delete} href={null} >
                    <span >&nbsp;</span >
                  </a >
                </td >
              </tr >
            ))}
          </tbody >
        </table >
      </div >
    );
  }

  render() {
    if (!this.context.activityFieldsManager) {
      return null;
    }

    return this.renderAsSimpleTable();
  }
}
