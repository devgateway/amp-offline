import { ErrorConstants, FieldsManager, WorkspaceConstants } from 'amp-ui';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './AFList.css';
import afStyles from '../ActivityForm.css';
import { LABEL } from './AFComponentTypes';
import ActivityValidator from '../../../../modules/field/EntityValidator';
import Logger from '../../../../modules/util/LoggerManager';
import AFField from './AFField';
import { addFullscreenAlert } from '../../../../actions/NotificationAction';
import Notification from '../../../../modules/helpers/NotificationHelper';

const logger = new Logger('AF List');

/* eslint-disable class-methods-use-this */

/**
 * Activity Form list of items like Locations, Programs, etc
 * @author Nadejda Mandrescu
 */
class AFList extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    activityValidator: PropTypes.instanceOf(ActivityValidator).isRequired,
  };

  static propTypes = {
    values: PropTypes.array.isRequired,
    listPath: PropTypes.string.isRequired,
    onDeleteRow: PropTypes.func,
    onEditRow: PropTypes.func,
    onConfirmationAlert: PropTypes.func.isRequired,
    extraParams: PropTypes.object,
    language: PropTypes.string, // Needed to update header translations.
    onBeforeDelete: PropTypes.func,
    workspacePrefix: PropTypes.string,
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
    this.fields = this.listDef.children.filter(f => f.importable).sort(
      (fieldA, fieldB) => {
        let res = fieldA.id_only === true ? -1 : undefined;
        res = res || (fieldB.id_only === true ? 1 : undefined);
        res = res || (fieldA.percentage === true ? -1 : undefined);
        res = res || (fieldB.percentage === true ? 1 : 0);
        return res;
      });
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
    const { values, language } = this.state;
    return values !== nextProps.values || values.length !== nextProps.values.length || language !== nextProps.language;
  }

  onDeleteRow(uniqueId) {
    const { listPath, onDeleteRow, onConfirmationAlert, onBeforeDelete } = this.props;
    const { activityValidator } = this.context;
    const itemToDelete = this.state.values.find(item => uniqueId === item.uniqueId);
    let canDelete = true;
    if (onBeforeDelete) {
      canDelete = onBeforeDelete(itemToDelete);
    }
    if (canDelete) {
      const validationResult = activityValidator.validateItemRemovalFromList(listPath, itemToDelete);
      if (validationResult && validationResult !== true) {
        onConfirmationAlert(validationResult);
      } else {
        this.setState({
          values: this.state.values.filter(item => uniqueId !== item.uniqueId)
        });
        onDeleteRow(uniqueId);
      }
    }
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

  renderAsSimpleTable() {
    const { listPath, extraParams } = this.props;
    const headers = [];
    const content = [];
    const collWidth = { width: 90 / this.fields.length };
    this.fields.forEach(childDef => {
      const childFieldName = childDef.field_name;
      const fieldPath = `${listPath}~${childFieldName}`;
      const editable = childDef.id_only !== true;
      const CustomType = extraParams && extraParams.custom && extraParams.custom[fieldPath];
      const fieldType = editable ? null : LABEL;
      const className = (editable || CustomType) ? styles.cell_editable : styles.cell_readonly;

      headers.push(this.context.activityFieldsManager.getFieldLabelTranslation(fieldPath, this.props.workspacePrefix));
      let rowId = 0;
      this.state.values.forEach(rowData => {
        if (rowId === content.length) {
          content.push({ rowData, cells: [] });
        }
        const key = (rowData[childFieldName] && rowData[childFieldName].uniqueId) || Math.random();
        const RenderType = CustomType || AFField;
        const value = (<RenderType
          fieldPath={fieldPath} parent={rowData} type={fieldType} showLabel={false} className={className} inline
          showRequired={editable} onAfterUpdate={this._afterSaveCell.bind(this, rowData, childFieldName)} />);
        content[rowId].cells.push({ key, value });
        rowId += 1;
      });
    });
    return (
      <div className="react-bs-table react-bs-table-bordered">
        <table className="table table-bordered table-hover">
          <tbody className="react-bs-container-body">
            <tr>
              {headers.map(header =>
                (<th className={styles.thClassName} style={collWidth} key={header}>{header}</th>))}
              <th className={`${styles.thDelete} ${styles.thClassName}`} />
            </tr>
            {content.map(row => (
              <tr key={row.rowData.uniqueId}>
                {row.cells.map(cell => (
                  <td key={cell.key} className={styles.cell}>{cell.value}</td>
                ))}
                <td className={styles.thDelete}>
                  <a
                    onClick={this.onDeleteRow.bind(this, row.rowData.uniqueId)} className={styles.delete} href={null}>
                    <span>&nbsp;</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    if (!this.context.activityFieldsManager) {
      return null;
    }

    return this.renderAsSimpleTable();
  }
}

export default connect(
  state => Object.assign({}, state, {
    workspacePrefix: state.workspaceReducer.currentWorkspace[WorkspaceConstants.PREFIX_FIELD]
  }),
  dispatch => ({
    onConfirmationAlert: (message) => dispatch(addFullscreenAlert(
      new Notification({ message, origin: ErrorConstants.NOTIFICATION_ORIGIN_ACTIVITY, translateMsg: false })
    ))
  })
)(AFList);
