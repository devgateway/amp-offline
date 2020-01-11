import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { UIUtils } from 'amp-ui';
import { setLanguage } from '../../actions/TranslationAction';
import styles from './i18n.css';
import Logger from '../../modules/util/LoggerManager';
import translate from '../../utils/translate';

const logger = new Logger('Switcher component');

class Switcher extends React.Component {

  static propTypes = {
    onChangeLanguage: PropTypes.func.isRequired,
    translationReducer: PropTypes.object.isRequired
  };

  renderListOfLanguages() {
    const { translationReducer, onChangeLanguage } = this.props;
    const options = translationReducer.languageList.reduce((content, lang) => {
      content.push(<span role="link" key={lang} onClick={() => onChangeLanguage(lang)}>{translate(lang, lang)}</span>);
      content.push(<span key={UIUtils.stringToUniqueId('separator')}> | </span>);
      return content;
    }, []);
    options.pop();
    return options;
  }

  render() {
    return (
      <div className={styles.flags_container}>
        {this.renderListOfLanguages()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  logger.debug('mapStateToProps');
  return {
    translationReducer: state.translationReducer
  };
};

const mapDispatchToProps = (dispatch) => {
  logger.debug('mapDispatchToProps');
  return {
    onChangeLanguage: (lan) => {
      dispatch(setLanguage(lan));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Switcher);
