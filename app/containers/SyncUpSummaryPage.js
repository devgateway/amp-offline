import { connect } from 'react-redux';
import SyncUpSummary from '../components/syncUp/SyncUpSummary';

function mapStateToProps({ syncUpReducer, translationReducer }, { params }) {
  const { historyData, errorMessage, forceSyncUp } = syncUpReducer;
  const { id } = params;

  return {
    errorMessage,
    lang: translationReducer.lang,
    forceSyncUp,
    data: id && historyData.length ?
      historyData.find(syncObj => syncObj.id === +id) :
      null
  };
}

export default connect(mapStateToProps)(SyncUpSummary);
