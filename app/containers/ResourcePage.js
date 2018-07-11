import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ResourceAction from '../actions/ResourceAction';
import Logger from '../modules/util/LoggerManager';
import AFDocument from '../components/activity/edit/sections/AFDocument';

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

// May export other pages when adding resources manager
// eslint-disable-next-line import/prefer-default-export
export const AFDocumentPage = connect(mapStateToProps, mapDispatchToProps)(AFDocument);
