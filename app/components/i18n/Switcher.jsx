import React from 'react';
import { connect } from 'react-redux';
import { setLanguage } from '../../actions/TranslationAction';
import styles from './i18n.css';
import LoggerManager from '../../modules/util/LoggerManager';

class Switcher extends React.Component {

  changeLanguage(lang) {
    LoggerManager.log('changeLanguage');
    this.props.onChangeLanguage(lang);
  }

  renderListOfLanguages() {
    return this.props.translation.languageList.map((lang) => {
      return <span key={lang} onClick={this.changeLanguage.bind(this, lang)}> {lang} |</span>;
    });
  }

  render() {
    return (
      <div className={styles.flags_container}>
        {this.renderListOfLanguages()}
      </div>
    );
  }
}

/* TODO: Check if is possible to move this section with Redux code to a new TranslationContainer. We did it this way
 because we dont have a router on index.js, then we cant load this container automatically. */
const mapStateToProps = (state, props) => {
  LoggerManager.log('mapStateToProps');
  return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
  LoggerManager.log('mapDispatchToProps');
  return {
    onChangeLanguage: (lan) => {
      dispatch(setLanguage(lan));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Switcher);
