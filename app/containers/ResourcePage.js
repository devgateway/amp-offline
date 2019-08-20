import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { APDocument } from 'amp-ui';
import { SHELL } from '../modules/util/ElectronApp';
import * as ResourceAction from '../actions/ResourceAction';
import Logger from '../modules/util/LoggerManager';
import AFDocument from '../components/activity/edit/sections/AFDocument';
import ResourceForm from '../components/resource/edit/ResourceForm';
import RepositoryManager from '../modules/repository/RepositoryManager';

const logger = new Logger('Resource Page');

const mapStateToProps = (state) => {
  logger.debug('mapStateToProps');
  return {
    resourceReducer: state.resourceReducer,
    openExternal: SHELL.openExternal,
    getFullContentFilePath: RepositoryManager.getFullContentFilePath,
    getActivityResourceUuids: ResourceAction.getActivityResourceUuids
  };
};

function mapDispatchToProps(dispatch, ownProps) {
  logger.debug('mapDispatchToProps');
  return bindActionCreators(ResourceAction, dispatch, ownProps);
}

export const APDocumentPage = connect(mapStateToProps, mapDispatchToProps)(APDocument);
export const AFDocumentPage = connect(mapStateToProps, mapDispatchToProps)(AFDocument);
export const ResourceFormPage = connect(mapStateToProps, mapDispatchToProps)(ResourceForm);
