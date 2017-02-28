// @flow
import React, { Component, PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import style from './ProjectList.css';
import translate from '../../utils/translate';
import IconFormatter from './IconFormatter';
import LinkFormatter from './LinkFormatter';
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

  linkFormatter(cell, row) {
    return (
      <LinkFormatter cell={cell} row={row}/>
    );
  }

  iconFormatter(cell, row) {
    return (
      <IconFormatter cell={cell} row={row}/>
    );
  }

  render() {
    console.log('render');
    // FFR: https://allenfang.github.io/react-bootstrap-table/example.html#style
    // FFR: https://allenfang.github.io/react-bootstrap-table/example.html#column-format
    return (
      <div className={style.container}>
        <Legends />
        <BootstrapTable data={this.props.projects} striped hover pagination
                        options={this.props.paginationOptions}
                        containerClass={style.containerTable}
                        tableHeaderClass={style.header}>
          <TableHeaderColumn dataField="icon"
                             dataFormat={this.iconFormatter}
                             columnClassName={style.empty_column}>
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="ampId"
            isKey
            dataAlign="center"
            dataSort>{translate('AMP ID')}
          </TableHeaderColumn>
          <TableHeaderColumn dataField="title" dataFormat={this.linkFormatter}
                             dataSort>{translate('Project Title')}</TableHeaderColumn>
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
