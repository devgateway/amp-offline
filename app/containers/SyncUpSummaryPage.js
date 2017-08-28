import { connect } from 'react-redux';
import SyncUpSummary from '../components/syncUp/SyncUpSummary';

function mapStateToProps({ syncUpReducer }, { params }) {
  const { historyData, errorMessage } = syncUpReducer;
  const { id } = params;

  return {
    errorMessage,
    data: id && historyData.length ?
      historyData.find(syncObj => syncObj.id === +id) :
      null
  };
}

export default connect(mapStateToProps)(SyncUpSummary);
