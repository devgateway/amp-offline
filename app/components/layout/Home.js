// @flow
import React, {Component} from 'react';
import Login from '../login/Login';
import LandingPageContent from './LandingPageContent';
import Footer from './Footer';
import {Link} from 'react-router';
import styles from './Home.css';


export default class Home extends Component {
  render() {
    return (
      <div>
        <LandingPageContent/>
        <hr/>
        <Footer/>
      </div>
    );
  }
}
