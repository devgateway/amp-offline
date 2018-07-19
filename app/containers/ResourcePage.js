import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ResourceAction from '../actions/ResourceAction';
import Logger from '../modules/util/LoggerManager';
import AFDocument from '../components/activity/edit/sections/AFDocument';
import ResourceForm from '../components/resource/edit/ResourceForm';

const logger = new Logger('Resource Page');

const mapStateToProps = (state) => {
  logger.debug('mapStateToProps');
  return {
    resourceReducer: state.resourceReducer,
  };
};

function mapDispatchToProps(dispatch, ownProps) {
  logger.debug('mapDispatchToProps');
  return bindActionCreators(ResourceAction, dispatch, ownProps);
}

export const AFDocumentPage = connect(mapStateToProps, mapDispatchToProps)(AFDocument);
export const ResourceFormPage = connect(mapStateToProps, mapDispatchToProps)(ResourceForm);
