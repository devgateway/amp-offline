import React from 'react';
import i18next from 'i18next';
import {connect} from 'react-redux';
import {setLanguage} from '../../actions/TranslationAction';
import styles from './i18n.css';
import {LANGUAGE_ENGLISH, LANGUAGE_SPANISH} from '../../utils/Constants';

class Switcher extends React.Component {

  constructor() {
    super();
  }

  changeLanguage(lan) {
    console.log('changeLanguage');
    i18next.changeLanguage(lan, (err, t) => {
      this.props.onChangeLanguage(lan);
    });
  }

  render() {
    return (
      <div className={styles.flags_container}>
        <img className={styles.usa_icon} onClick={this.changeLanguage.bind(this, LANGUAGE_ENGLISH)}/>
        <img className={styles.spa_icon} onClick={this.changeLanguage.bind(this, LANGUAGE_SPANISH)}/>
      </div>
    );
  }
}

/*TODO: Check if is possible to move this section with Redux code to a new TranslationContainer. We did it this way
 because we dont have a router on index.js, then we cant load this container automatically. */
const mapStateToProps = (state, props) => {
  console.log('mapStateToProps');
  return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
  console.log('mapDispatchToProps');
  return {
    onChangeLanguage: (lan) => {
      dispatch(setLanguage(lan))
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Switcher);
