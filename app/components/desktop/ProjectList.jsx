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
import { getGeneralPaginationOptions } from '../../modules/desktop/DesktopManager'; // TODO: receive as props.
import { AMP_ID, PROJECT_TITLE } from '../../utils/constants/ActivityConstants';
import LoggerManager from '../../modules/util/LoggerManager';
import NumberUtils from '../../utils/NumberUtils';

export default class ProjectList extends Component {

  static propTypes = {
    projects: PropTypes.array.isRequired
  };

  linkFormatter(cell, row) {
    return (
      <LinkFormatter cell={cell} row={row} />
    );
  }

  iconFormatter(cell, row) {
    return (
      <IconFormatter cell={cell} row={row} />
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
    if (row['client-change-id'] && !row.rejectedId) {
      nameStyles.push(style.unsynced);
    } else if (row.rejectedId) {
      nameStyles.push(style.rejected);
    }
    const classes = classNames(nameStyles.toString()).replace(',', ' ');
    return `<span class='${classes}'>${row.new ? '* ' : ''}${cell}</span>`;
  }

  numberFormatter(cell) {
    const number = Number(cell);
    return NumberUtils.rawNumberToFormattedString(number);
  }

  handlerClickCleanFiltered() {
    this.refs[AMP_ID].cleanFiltered();
    this.refs[PROJECT_TITLE].cleanFiltered();
  }

  render() {
    LoggerManager.log('render');
    // FFR: https://allenfang.github.io/react-bootstrap-table/example.html#style
    // FFR: https://allenfang.github.io/react-bootstrap-table/example.html#column-format
    const paginationOptions = getGeneralPaginationOptions(this.props.projects.length);
    const pagination = paginationOptions.usePagination;
    return (
      <div className={style.container}>
        <a onClick={this.handlerClickCleanFiltered.bind(this)} className={style.clearFilters}>
          {translate('Reset All')}
        </a>
        <BootstrapTable
          data={this.props.projects} striped hover pagination={pagination} options={paginationOptions}
          containerClass={style.containerTable} tableHeaderClass={style.header} thClassName={style.thClassName}
        >
          <TableHeaderColumn
            dataField="icon" dataFormat={this.iconFormatter} columnClassName={style.width_7}
            className={style.thClassName} />
          <TableHeaderColumn
            dataField={AMP_ID} isKey dataAlign="center" dataSort ref={AMP_ID} columnClassName={style.width_8}
            filter={{ type: 'TextFilter', placeholder: translate('enter AMP ID#') }} className={style.thClassName}>
            {translate('AMP ID')}
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField={PROJECT_TITLE} dataFormat={this.projectNameFormatter} dataSort ref="project_title"
            columnClassName={style.width_40}
            filter={{ type: 'TextFilter', placeholder: translate('enter project title') }}
            className={style.thClassName}>
            {translate('Project Title')}
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="donor" dataSort columnClassName={style.width_15}
            className={style.thClassName}>{translate('Funding Agency')}
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="actualCommitments" dataSort columnClassName={style.width_15} className={style.thClassName}
            dataFormat={this.numberFormatter}>
            {translate('Actual Commitments')}
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="actualDisbursements" dataSort columnClassName={style.width_15} className={style.thClassName}
            dataFormat={this.numberFormatter}>
            {translate('Actual Disbursements')}
          </TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}
