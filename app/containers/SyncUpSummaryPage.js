import { connect } from 'react-redux';
import SyncUpSummary from '../components/syncUp/SyncUpSummary';
import { getSyncUpHistory } from '../actions/SyncUpAction';

function mapStateToProps(state) {
  return {
    data: state.syncUpReducer.historyData[0]
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
