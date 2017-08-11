import { connect } from 'react-redux';
import SyncUpSummary from '../components/syncUp/SyncUpSummary';
import { getSyncUpHistory } from '../actions/SyncUpAction';

function mapStateToProps(state) {
  return {
    history: state.syncUpReducer.historyData
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getHistory: () => {
      dispatch(getSyncUpHistory());
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SyncUpSummary);
