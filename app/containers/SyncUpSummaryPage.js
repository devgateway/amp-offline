import { connect } from 'react-redux';
import SyncUpSummary from '../components/syncUp/SyncUpSummary';
import { loadSyncUpHistory } from '../actions/SyncUpAction';

function mapStateToProps(state, ownProps) {
  const { historyData } = state.syncUpReducer;
  const { id } = ownProps.params;
  let data;
  if (historyData.length) {
    if (id) {
      data = historyData.find(syncObj => syncObj.id === +id);
    } else {
      data = historyData.reduce((a, b) => (b.id > a.id ? b : a));
    }
  }
  return {
    data
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getHistory: () => {
      dispatch(loadSyncUpHistory());
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SyncUpSummary);
