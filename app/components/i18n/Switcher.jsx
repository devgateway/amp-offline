import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { setLanguage } from '../../actions/TranslationAction';
import styles from './i18n.css';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Switcher component');

class Switcher extends React.Component {

  static propTypes = {
    onChangeLanguage: PropTypes.func,
    translationReducer: PropTypes.object
  }

  changeLanguage(lang) {
    logger.log('changeLanguage');
    this.props.onChangeLanguage(lang);
  }

  renderListOfLanguages() {
    return this.props.translationReducer.languageList.map((lang) =>
      <span role="link" key={lang} onClick={this.changeLanguage.bind(this, lang)}> {lang} |</span>
    );
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
const mapStateToProps = (state) => {
  logger.log('mapStateToProps');
  return state;
};

const mapDispatchToProps = (dispatch) => {
  logger.log('mapDispatchToProps');
  return {
    onChangeLanguage: (lan) => {
      dispatch(setLanguage(lan));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Switcher);
