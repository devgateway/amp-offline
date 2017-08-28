import { connect } from 'react-redux';
import SyncUpSummary from '../components/syncUp/SyncUpSummary';

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

export default connect(mapStateToProps)(SyncUpSummary);
