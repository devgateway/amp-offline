// @flow
import React, { Component, PropTypes } from "react";
import styles from "./Workspace.css";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";

export default class WorkspaceList extends Component {

  constructor() {
    super();
    console.log('constructor');
  }
  render() {
    let tableOptions = {
      onRowClick: row => {
        const worspaceId = row.id;
        this.props.onClickHandler(worspaceId);
      }
    };
    return (
      <BootstrapTable data={ this.props.workspaceList} options={tableOptions}
                      keyField='id'
                      tableHeaderClass={styles.table}
                      bordered={false}
                      striped
                      hover
                      trClassName={styles.row}>
        <TableHeaderColumn dataField='name'>{this.props.workspaceGroup}</TableHeaderColumn>
      </BootstrapTable>
    );
  }
}
