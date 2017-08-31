/* eslint react/jsx-space-before-closing: 0 */
/* eslint react/forbid-prop-types: 0 */
/* eslint react/no-did-mount-set-state: 0 */
/* eslint react/no-did-update-set-state: 0 */
import React, { Component, PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
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
import {
  AMP_ID,
  PROJECT_TITLE,
  DESKTOP_COLUMN_RATIOS,
  DEFAULT_DESKTOP_WIDTH
} from '../../utils/constants/ActivityConstants';
import LoggerManager from '../../modules/util/LoggerManager';
import NumberUtils from '../../utils/NumberUtils';
import Utils from '../../utils/Utils';

export default class ProjectList extends Component {

  static propTypes = {
    projects: PropTypes.array.isRequired
  };

  static linkFormatter(cell, row) {
    return (
      <LinkFormatter cell={cell} row={row} />
    );
  }

  static iconFormatter(cell, row) {
    return (
      <IconFormatter cell={cell} row={row} />
    );
  }

  static textFormatter(cell, row, extraData) {
    const columnWidth = Math.round(DESKTOP_COLUMN_RATIOS[extraData.label] * extraData.offset);
    const cellDisplay = Utils.textTruncate(cell, columnWidth);
    const tooltip = <Tooltip id={`${extraData.label}-tooltip-${row.id}`}>{cell}</Tooltip>;
    return (<OverlayTrigger
      placement="bottom" overlay={tooltip}><span className={extraData.classes}>{cellDisplay}</span></OverlayTrigger>);
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

  constructor(props) {
    super(props);
    this.state = { tableOffset: DEFAULT_DESKTOP_WIDTH };
  }

  componentDidMount() {
    const width = this.tableWidth.offsetWidth;
    this.setState({ tableOffset: width });
  }

  componentDidUpdate() {
    const width = this.tableWidth.offsetWidth;
    if (width !== this.state.tableOffset) {
      this.setState({ tableOffset: width });
    }
  }

  handlerClickCleanFiltered() {
    this.filter[AMP_ID].cleanFiltered();
    this.filter[PROJECT_TITLE].cleanFiltered();
  }

  render() {
    LoggerManager.log('render');
    // FFR: https://allenfang.github.io/react-bootstrap-table/example.html#style
    // FFR: https://allenfang.github.io/react-bootstrap-table/example.html#column-format
    const paginationOptions = getGeneralPaginationOptions(this.props.projects.length);
    const pagination = paginationOptions.usePagination;
    const offsetWidth = this.state.tableOffset;
    return (
      <div className={style.container} ref={ref => (this.tableWidth = ref)}>
        <a role="link" onClick={this.handlerClickCleanFiltered.bind(this)} className={style.clearFilters}>
          {translate('Reset All')}
        </a>
        <BootstrapTable
          data={this.props.projects} striped hover pagination={pagination} options={paginationOptions}
          containerClass={style.containerTable} tableHeaderClass={style.header} thClassName={style.thClassName}
        >
          <TableHeaderColumn
            dataField="icon" dataFormat={ProjectList.iconFormatter} columnClassName={style.width_7}
            className={style.thClassName} />
          <TableHeaderColumn
            dataField={AMP_ID} isKey dataAlign="center" dataSort columnClassName={style.width_8}
            filter={{ type: 'TextFilter', placeholder: translate('enter AMP ID#') }} className={style.thClassName}
            dataFormat={ProjectList.textFormatter} ref={AMP_ID}
            formatExtraData={{ label: 'id', offset: offsetWidth }} >
            {translate('AMP ID')}
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField={PROJECT_TITLE} dataFormat={ProjectList.projectNameFormatter} dataSort ref={PROJECT_TITLE}
            columnClassName={style.width_40} formatExtraData={{ label: 'title', offset: offsetWidth }}
            filter={{ type: 'TextFilter', placeholder: translate('enter project title') }}
            className={style.thClassName}>
            {translate('Project Title')}
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="donor" dataSort columnClassName={style.width_15} dataFormat={ProjectList.textFormatter}
            className={style.thClassName}
            formatExtraData={{ label: 'funding', offset: offsetWidth }}> {translate('Funding Agency')}
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="actualCommitments" dataSort columnClassName={style.width_15} className={style.thClassName}
            dataFormat={ProjectList.numberFormatter} columnTitle formatExtraData={{ label: 'AC', offset: offsetWidth }}>
            {translate('Actual Commitments')}
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="actualDisbursements" dataSort columnClassName={style.width_15} className={style.thClassName}
            dataFormat={ProjectList.numberFormatter} columnTitle formatExtraData={{ label: 'AD', offset: offsetWidth }}>
            {translate('Actual Disbursements')}
          </TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}
