import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Settings from '../components/settings/Settings';
import * as SettingAction from '../actions/SettingAction';

function mapStateToProps({ settingReducer, setupReducer, translationReducer }) {
  const { isSettingsLoading, isSettingsLoaded, settings, errorMessage, isSettingsSaving, isSettingsSaved, newUrls }
    = settingReducer;
  const { urlTestResult, isUrlTestInProgress } = setupReducer;
  return {
    isSettingsLoading,
    isSettingsLoaded,
    isSettingsSaving,
    isSettingsSaved,
    settings,
    newUrls,
    errorMessage,
    isUrlTestInProgress,
    urlTestResult,
    lang: translationReducer.lang
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return bindActionCreators(SettingAction, dispatch, ownProps);
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
