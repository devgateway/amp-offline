/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Glyphicon } from 'react-bootstrap';
import Logger from '../../modules/util/LoggerManager';
import * as Utils from '../../utils/Utils';
import translate from '../../utils/translate';
import tabStyle from '../desktop/ProjectList.css';
import appStyle from '../layout/App.css';
import AmpTooltip from '../common/AmpTooltip';
import * as URLUtils from '../../utils/URLUtils';
import { testUrlByKeepingCurrentSetup, testUrlResultProcessed } from '../../actions/SetupAction';
import URLInsertModal from './URLInsertModal';

const logger = new Logger('List Setting');

/**
 * URL Settings section.
 *
 * @author Nadejda Mandrescu
 */
class URLSettings extends Component {
  static propTypes = {
    setting: PropTypes.object,
    urlTestResult: PropTypes.object,
    onUrlTest: PropTypes.func.isRequired,
    onUrlTestResult: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
  };

  static createCustomInsertModal(onModalClose, onSave, columns, validateState, ignoreEditable) {
    const props = {
      onModalClose, onSave, columns, validateState, ignoreEditable
    };
    return <URLInsertModal {...props} />;
  }

  static availabilityFormatter(availability) {
    let tooltip;
    let content;
    if (availability.isAvailable === undefined) {
      tooltip = translate('testingConnectivity');
      content = <img className={appStyle.loading_icon} alt="connectivity" />;
    } else if (availability.isAvailable) {
      tooltip = translate('connectionUp');
      content = <Glyphicon glyph="glyphicon glyphicon-ok-circle text-success" />;
    } else {
      tooltip = translate('connectionDown');
      content = <Glyphicon glyph="glyphicon glyphicon-remove-circle text-danger" />;
    }
    return (<div>
      <AmpTooltip tooltip={tooltip} content={content} />
      <div>{availability.errorMessage}</div>
    </div>);
  }

  constructor(props) {
    super(props);
    logger.debug('constructor');
    const { setting } = props;
    const urls = (setting && setting.value.urls) || [];
    this.state = {
      dataSource: urls.map(url => ({
        id: Utils.stringToUniqueId(url),
        url,
        availability: {
          isAvailable: undefined,
          errorMessage: undefined
        }
      }))
    };
  }

  componentWillMount() {
    const { dataSource } = this.state;
    dataSource.forEach(ds => this.props.onUrlTest(ds.url));
  }

  componentWillReceiveProps(nextProps) {
    const { urlTestResult, onUrlTestResult } = nextProps;
    const { dataSource } = this.state;
    const { url, goodUrl, errorMessage } = urlTestResult || {};
    if (url) {
      onUrlTestResult(url);
      const urlDs = dataSource.find(ds => ds.url === url);
      if (urlDs) {
        const isAvailable = !!goodUrl;
        const isChanged = isAvailable !== urlDs.availability.isAvailable;
        if (isChanged) {
          urlDs.url = goodUrl || url;
          urlDs.availability.isAvailable = !!goodUrl;
          urlDs.availability.errorMessage = errorMessage;
        }
        const newDataSource = dataSource.filter(ds => ds.id === urlDs.id || ds.url !== urlDs.url);
        // cannot rely on validator, see this.validateValue
        if (newDataSource.length !== dataSource.length) {
          this.handleChange(newDataSource);
        } else if (isChanged) {
          this.setState({ dataSource: newDataSource });
        }
      }
    }
  }

  handleInsertedRow(row) {
    const { dataSource } = this.state;
    const newUrl = { id: row.id, url: URLUtils.normalizeUrl(row.url), availability: {} };
    dataSource.push(newUrl);
    this.props.onUrlTest(newUrl.url);
    this.handleChange(dataSource);
  }

  handleDeletedRow(rowKeys) {
    this.handleChange(this.state.dataSource.filter(dsUrl => dsUrl.id !== rowKeys[0]));
  }

  // eslint-disable-next-line no-unused-vars
  validateValue(url) {
    /* we need v4.0.0+ to also be abele to report configurable validation error during insert
    url = URLUtils.normalizeUrl(url);
    const dsUrl = this.state.dataSource.find(ds => ds.url === url);
    return dsUrl ? translate('duplicateUrl') : true;
    */
    return true;
  }

  afterSaveCell(row, cellName, cellValue) {
    const { dataSource } = this.state;
    const dsUrl = dataSource.find(ds => ds.id === row.id);
    dsUrl.url = URLUtils.normalizeUrl(cellValue);
    this.props.onUrlTest(dsUrl.url);
    this.handleChange(dataSource);
  }

  handleChange(dataSource) {
    const urls = dataSource.map(dsUrl => dsUrl.url);
    const { setting } = this.props;
    setting.value.urls = urls;
    this.setState({ dataSource });
    this.props.onChange(setting);
  }

  render() {
    const { dataSource } = this.state;
    const options = {
      insertText: '',
      deleteText: '',
      afterInsertRow: this.handleInsertedRow.bind(this),
      afterDeleteRow: this.handleDeletedRow.bind(this),
      insertModal: this.constructor.createCustomInsertModal,
      insertFailIndicator: translate('duplicateUrl')
    };
    const selectRow = {
      mode: 'checkbox'
    };
    const cellEdit = {
      mode: 'click',
      blurToSave: true,
      afterSaveCell: this.afterSaveCell.bind(this)
    };
    return (<div>
      <BootstrapTable
        data={dataSource} striped hover
        containerClass={tabStyle.containerTable} tableHeaderClass={tabStyle.header} thClassName={tabStyle.thClassName}
        insertRow selectRow={selectRow} deleteRow cellEdit={cellEdit} options={options}
      >
        <TableHeaderColumn dataField="id" isKey autoValue editable={false} hidden hiddenOnInsert />
        <TableHeaderColumn
          dataField="url" className={tabStyle.thClassName} editable={{ validator: this.validateValue.bind(this) }}>
          {translate('ampServerUrl')}
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="availability" editable={false} dataAlign="center" dataFormat={URLSettings.availabilityFormatter}
          hiddenOnInsert className={tabStyle.thClassName} columnClassName={tabStyle.width_40}
        />
      </BootstrapTable>
    </div>);
  }
}

export default connect(
  state => ({
    urlTestResult: state.setupReducer.urlTestResult
  }),
  dispatch => ({
    onUrlTest: (url) => dispatch(testUrlByKeepingCurrentSetup(url)),
    onUrlTestResult: (url) => dispatch(testUrlResultProcessed(url))
  })
)(URLSettings);
