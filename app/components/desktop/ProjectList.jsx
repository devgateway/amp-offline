/* eslint react/jsx-space-before-closing: 0 */
/* eslint react/forbid-prop-types: 0 */
import React, { Component, PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import classNames from 'classnames';
import style from './ProjectList.css';
import translate from '../../utils/translate';
import IconFormatter from './IconFormatter';
import LinkFormatter from './LinkFormatter';
import {
  ACTIVITY_STATUS_DRAFT,
  ACTIVITY_STATUS_UNVALIDATED,
  ACTIVITY_STATUS_VALIDATED
} from '../../utils/Constants';
import { getGeneralPaginationOptions } from '../../modules/projects/DesktopManager'; // TODO: receive as props.

export default class ProjectList extends Component {

  static propTypes = {
    projects: PropTypes.array.isRequired,
    paginationOptions: PropTypes.object.isRequired
  };

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

  projectNameFormatter(cell, row) {
    const nameStyles = [];
    switch (row.status) {
      case ACTIVITY_STATUS_DRAFT:
        nameStyles.push(style.status_draft);
        break;
      case ACTIVITY_STATUS_UNVALIDATED:
        nameStyles.push(style.status_unvalidated);
        break;
      case ACTIVITY_STATUS_VALIDATED:
        nameStyles.push(style.status_validated);
        break;
      default:
        break;
    }
    if (!row.synced) {
      nameStyles.push(style.uncynced);
    }
    const classes = classNames(nameStyles.toString()).replace(',', ' ');
    return `<span class='${classes}'>${row.new ? '* ' : ''}${cell}</span>`;
  }

  handlerClickCleanFiltered() {
    this.refs.amp_id.cleanFiltered();
    this.refs.project_title.cleanFiltered();
  }

  render() {
    console.log('render');
    // FFR: https://allenfang.github.io/react-bootstrap-table/example.html#style
    // FFR: https://allenfang.github.io/react-bootstrap-table/example.html#column-format
    const paginationOptions = getGeneralPaginationOptions(this.props.projects.length);
    const pagination = paginationOptions.usePagination;
    return (
      <div className={style.container}>
        <a onClick={this.handlerClickCleanFiltered.bind(this)} className={style.clearFilters}>
          {translate('Clear filters')}
        </a>
        <BootstrapTable
          data={this.props.projects} striped hover pagination={pagination} options={paginationOptions}
          containerClass={style.containerTable} tableHeaderClass={style.header}
        >
          <TableHeaderColumn dataField="icon" dataFormat={this.iconFormatter} columnClassName={style.column_5}/>
          <TableHeaderColumn
            dataField="amp_id" isKey dataAlign="center" dataSort ref="amp_id" columnClassName={style.column_10}
            filter={{ type: 'TextFilter', placeholder: translate('enter AMP ID#') }}>
            {translate('AMP ID')}
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="project_title" dataFormat={this.projectNameFormatter} dataSort ref="project_title"
            columnClassName={style.column_40}
            filter={{ type: 'TextFilter', placeholder: translate('enter project title') }}>
            {translate('Project Title')}
          </TableHeaderColumn>
          <TableHeaderColumn dataField="donor" dataSort
                             columnClassName={style.column_15}>{translate('Funding Agency')}
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="actualCommitments" dataSort columnClassName={style.column_15}>
            {translate('Actual Commitments')}
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="actualDisbursements" dataSort columnClassName={style.column_15}>
            {translate('Actual Disbursements')}
          </TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}
