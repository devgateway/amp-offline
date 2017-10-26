import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Setup from '../components/setup/Setup';
import * as SetupAction from '../actions/SetupAction';

function mapStateToProps({ setupReducer, translationReducer }) {
  return {
    ...setupReducer,
    lang: translationReducer.lang,
    languageList: translationReducer.languageList,
    defaultLang: translationReducer.defaultLang
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return bindActionCreators(SetupAction, dispatch, ownProps);
}


export default connect(mapStateToProps, mapDispatchToProps)(Setup);
