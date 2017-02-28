// @flow
import React, { Component, PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import style from './ProjectList.css';
import translate from '../../utils/translate';
import Legends from './Legends';

export default class ProjectList extends Component {

  static propTypes = {
    projects: PropTypes.array.isRequired,
    paginationOptions: PropTypes.object.isRequired
  };

  constructor() {
    super();
    console.log('constructor');
  }

  render() {
    console.log('render');
    return (
      <div className={style.container}>
        <Legends />
        <BootstrapTable data={this.props.projects} striped hover pagination
                        options={this.props.paginationOptions}
                        containerClass={style.containerTable}
                        tableHeaderClass={style.header}>
          <TableHeaderColumn
            dataField="ampId"
            isKey
            dataAlign="center"
            dataSort>{translate('AMP ID')}
          </TableHeaderColumn>
          <TableHeaderColumn dataField="title" dataSort>{translate('Project Title')}</TableHeaderColumn>
          <TableHeaderColumn dataField="fundingAgency" dataSort>{translate('Funding Agency')}</TableHeaderColumn>
          <TableHeaderColumn dataField="actualCommitments"
                             dataSort>{translate('Actual Commitments')}</TableHeaderColumn>
          <TableHeaderColumn dataField="actualDisbursements"
                             dataSort>{translate('Actual Disbursements')}</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}
