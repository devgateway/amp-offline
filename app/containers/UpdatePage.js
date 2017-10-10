import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Update from '../components/update/Update';
import * as UpdateAction from '../actions/UpdateAction';

function mapStateToProps({ updateReducer, ampConnectionStatusReducer }, { params }) {
  const { errorMessage, fullUpdateFileName, downloadingUpdate, downloadedUpdate, installingUpdate, installUpdateFailed }
  = updateReducer;
  return {
    errorMessage,
    fullUpdateFileName,
    downloadingUpdate,
    downloadedUpdate,
    installingUpdate,
    installUpdateFailed,
    ...params,
    connectivityStatus: ampConnectionStatusReducer.status
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return bindActionCreators(UpdateAction, dispatch, ownProps);
}


export default connect(mapStateToProps, mapDispatchToProps)(Update);
