// @flow
import React, {Component, PropTypes} from 'react';
import styles from './Workspace.css';

import {Link} from 'react-router';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {forwardTo} from '../../utils/URLUtils'

export default class WorkspaceList extends Component {

  constructor() {
    super();
    console.log('constructor');
  }

  render() {
    let tableOptions = {
      onRowClick: row => {
        const worspaceId = row.id;
        forwardTo('/desktop/' + worspaceId + '?WorkspaceName=' + row.name);
      }
    };
    return (
      <BootstrapTable data={ this.props.workspaceList} options={tableOptions}
                      keyField='id'
                      tableHeaderClass={styles.table}
                      bordered={false}
                      striped
                      hover
                      trClassName={styles.row}
      >
        <TableHeaderColumn dataField='name'>Government</TableHeaderColumn>
      </BootstrapTable>
    );
  }
}
