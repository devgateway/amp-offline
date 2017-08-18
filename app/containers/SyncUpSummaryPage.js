import { connect } from 'react-redux';
import SyncUpSummary from '../components/syncUp/SyncUpSummary';
import { getSyncUpHistory, loadActivityTitles } from '../actions/SyncUpAction';

function mapStateToProps(state) {
  return {
    history: state.syncUpReducer.historyData,
    activityTitles: state.syncUpReducer.activityTitles
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getHistory: () => {
      dispatch(getSyncUpHistory());
    },
    getActivitiesNames: (ids) => {
      dispatch(loadActivityTitles(ids));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SyncUpSummary);
