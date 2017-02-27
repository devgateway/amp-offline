// @flow
import React, { Component, PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import style from './ProjectList.css';
import translate from '../../utils/translate';
import { ACTIVITY_PREVIEW_URL, ACTIVITY_EDIT_URL, ACTIVITY_EDIT, ACTIVITY_VIEW } from '../../utils/Constants';

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
    // FFR: https://allenfang.github.io/react-bootstrap-table/example.html#style
    // FFR: https://allenfang.github.io/react-bootstrap-table/example.html#column-format
    return (
      <div className={style.container}>
        <BootstrapTable data={this.props.projects} striped hover pagination
                        options={this.props.paginationOptions}
                        containerClass={style.containerTable}
                        tableHeaderClass={style.header}>
          <TableHeaderColumn dataField="icon"
                             dataFormat={iconFormatter}
                             columnClassName={style.empty_column}>
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="ampId"
            isKey
            dataAlign="center"
            dataSort>{translate('AMP ID')}
          </TableHeaderColumn>
          <TableHeaderColumn dataField="title" dataFormat={linkFormatter}
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

class LinkFormatter extends Component {
  render() {
    // TODO: This link could be dispatch to some action too if needed.
    const link = ACTIVITY_PREVIEW_URL + '/' + this.props.row.ampId;
    return (
      <a href={link}>{this.props.row.title}</a>
    );
  }
}

function linkFormatter(cell, row) {
  return (
    <LinkFormatter cell={cell} row={row}/>
  );
}

class IconFormatter extends Component {
  render() {
    // TODO: These links could be dispatch to some action too if needed.
    if (this.props.row.edit) {
      return <img alt="edit" src="../resources/images/edit.svg" width={15}/>;
    }
    if (this.props.row.view) {
      return <img alt="view" src="../resources/images/view.svg" width={15}/>;
    }
    return <span></span>;
  }
}

function iconFormatter(cell, row) {
  return (
    <IconFormatter cell={cell} row={row}/>
  );
}
