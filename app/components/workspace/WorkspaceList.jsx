/* eslint react/forbid-prop-types:  */
import React, { Component, PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import styles from './Workspace.css';

export default class WorkspaceList extends Component {

  static propTypes = {
    workspaceList: PropTypes.array.isRequired,
    onClickHandler: PropTypes.func.isRequired,
    workspaceGroup: PropTypes.object.isRequired
  };

  render() {
    const tableOptions = {
      onRowClick: row => {
        const workspaceId = row.id;
        this.props.onClickHandler(workspaceId);
      }
    };
    return (
      <BootstrapTable
        data={this.props.workspaceList} options={tableOptions} keyField="id" tableHeaderClass={styles.table}
        bordered={false} striped hover trClassName={styles.row}>
        <TableHeaderColumn dataField="name">{this.props.workspaceGroup}</TableHeaderColumn>
      </BootstrapTable>
    );
  }
}
