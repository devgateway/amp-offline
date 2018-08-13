/* eslint react/jsx-space-before-closing: 0 */
/* eslint react/forbid-prop-types: 0 */
/* eslint react/no-string-refs: 0 */
import React, { Component, PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn, SizePerPageDropDown } from 'react-bootstrap-table';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import classNames from 'classnames';
import style from './ProjectList.css';
import translate from '../../utils/translate';
import IconFormatter from './IconFormatter';
import LinkFormatter from './LinkFormatter';
import { ACTIVITY_STATUS_DRAFT, ACTIVITY_STATUS_UNVALIDATED, ACTIVITY_STATUS_VALIDATED } from '../../utils/Constants';
import { getGeneralPaginationOptions } from '../../modules/desktop/DesktopManager'; // TODO: receive as props.
import * as AC from '../../utils/constants/ActivityConstants';
import * as WC from '../../utils/constants/WorkspaceConstants';
import Logger from '../../modules/util/LoggerManager';
import NumberUtils from '../../utils/NumberUtils';
import { stripTags } from '../../utils/Utils';

const logger = new Logger('Project list');

export default class ProjectList extends Component {

  static propTypes = {
    projects: PropTypes.array.isRequired,
    userReducer: PropTypes.object.isRequired,
    workspaceReducer: PropTypes.object.isRequired
  };

  static linkFormatter(cell, row) {
    return (
      <LinkFormatter cell={cell} row={row} />
    );
  }

  static iconFormatter(cell, row) {
    const teamLeadFlag = this.props.userReducer.teamMember[WC.ROLE_ID] === WC.ROLE_TEAM_MEMBER_WS_MANAGER
      || this.props.userReducer.teamMember[WC.ROLE_ID] === WC.ROLE_TEAM_MEMBER_WS_APPROVER;
    return (
      <IconFormatter
        cell={cell}
        id={row.id} edit={row.edit} view={row.view} status={row.status}
        activityTeamId={row[AC.TEAM]}
        teamId={this.props.userReducer.teamMember[WC.WORKSPACE_ID]}
        teamLeadFlag={teamLeadFlag}
        wsAccessType={this.props.workspaceReducer.currentWorkspace[WC.ACCESS_TYPE]}
        crossTeamWS={this.props.workspaceReducer.currentWorkspace[WC.CROSS_TEAM_VALIDATION]} />
    );
  }

  static textFormatter(cell, row, extraData) {
    if (Array.isArray(cell)) {
      cell = cell.map((item, index) => {
        if (index < cell.length - 1) return `${stripTags(item)}, `;
        else return stripTags(item);
      });
    } else {
      cell = stripTags(cell);
    }
    const tooltip = <Tooltip id={`${extraData.label}-tooltip-${row.id}`}>{cell}</Tooltip>;
    return (<OverlayTrigger
      placement="left" overlay={tooltip}><span className={extraData.classes}>{cell}</span></OverlayTrigger>);
  }

  static projectNameFormatter(cell, row, extraData) {
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
    const cellDisplay = `${row.new ? '* ' : ''}${cell}`;
    extraData.classes = classes;
    return ProjectList.textFormatter(cellDisplay, row, extraData);
  }

  static numberFormatter(cell, row, extraData) {
    const number = NumberUtils.rawNumberToFormattedString(Number(cell));
    return ProjectList.textFormatter(number, row, extraData);
  }

  static renderSizePerPageDropdown(props) {
    const { sizePerPageList } = props;
    const sizePerPageOptions = sizePerPageList.map((_sizePerPage) => {
      const pageText = _sizePerPage.text || _sizePerPage;
      const pageNum = _sizePerPage.value || _sizePerPage;
      return (
        <li key={pageText} role="presentation" className="dropdown-item">
          <a
            href={`#${pageNum}`}
            role="menuitem"
            tabIndex="-1"
            data-page={pageNum}
            onMouseDown={e => {
              e.preventDefault();
              props.changeSizePerPage(pageNum);
            }}
          >{ pageText }</a>
        </li>
      );
    });

    return (
      <span className={style.sizePerPageDropDownWrapper}>
        <SizePerPageDropDown
          onClick={props.toggleDropDown}
          options={sizePerPageOptions}
          {...props}
        />
      </span>
    );
  }

  static renderPaginationShowsTotal(start, to, total) {
    return (
      <span>
        {translate('tablesRowsCount').replace('%from%', start).replace('%to%', to).replace('%total%', total)}
      </span>
    );
  }


  handlerClickCleanFiltered() {
    this.refs[AC.AMP_ID].cleanFiltered();
    this.refs[AC.PROJECT_TITLE].cleanFiltered();
  }

  render() {
    logger.log('render');
    // FFR: https://allenfang.github.io/react-bootstrap-table/example.html#style
    // FFR: https://allenfang.github.io/react-bootstrap-table/example.html#column-format
    const paginationOptions = getGeneralPaginationOptions(this.props.projects.length);
    paginationOptions.sizePerPageDropDown = this.constructor.renderSizePerPageDropdown;
    paginationOptions.noDataText = translate('noDataText');
    paginationOptions.paginationShowsTotal = ProjectList.renderPaginationShowsTotal;
    const pagination = paginationOptions.usePagination;
    return (
      <div className={style.container}>
        <a role="link" onClick={this.handlerClickCleanFiltered.bind(this)} className={style.clearFilters}>
          {translate('Reset All')}
        </a>
        <BootstrapTable
          data={this.props.projects} striped hover pagination={pagination} options={paginationOptions}
          containerClass={style.containerTable} tableHeaderClass={style.header} thClassName={style.thClassName}
        >
          <TableHeaderColumn
            dataField="icon" dataFormat={ProjectList.iconFormatter.bind(this)} columnClassName={style.width_7}
            className={style.thClassName} />
          <TableHeaderColumn
            dataField={AC.AMP_ID} isKey dataAlign="center" dataSort columnClassName={style.width_8}
            filter={{ type: 'TextFilter', placeholder: translate('enter AMP ID#') }} className={style.thClassName}
            dataFormat={ProjectList.textFormatter} ref={AC.AMP_ID}
            formatExtraData={{ label: 'id' }}>
            {translate('AMP ID')}
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField={AC.PROJECT_TITLE} dataFormat={ProjectList.projectNameFormatter} dataSort ref={AC.PROJECT_TITLE}
            columnClassName={style.width_40} formatExtraData={{ label: 'title' }}
            filter={{ type: 'TextFilter', placeholder: translate('enter project title') }}
            className={style.thClassName}>
            {translate('Project Title')}
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="donor" dataSort columnClassName={style.width_15} dataFormat={ProjectList.textFormatter}
            className={style.thClassName}
            formatExtraData={{ label: 'funding' }}> {translate('Funding Agency')}
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="actualCommitments" dataSort columnClassName={style.width_15} className={style.thClassName}
            dataFormat={ProjectList.numberFormatter} columnTitle formatExtraData={{ label: 'AC' }}>
            {translate('Actual Commitments')}
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="actualDisbursements" dataSort columnClassName={style.width_15} className={style.thClassName}
            dataFormat={ProjectList.numberFormatter} columnTitle formatExtraData={{ label: 'AD' }}>
            {translate('Actual Disbursements')}
          </TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}
