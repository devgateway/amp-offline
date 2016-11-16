// @flow
import React, {Component} from 'react';
import Login from './Login';
import LandingPageContent from './LandingPageContent';
import Footer from '../layout/Footer';
import {Link} from 'react-router';
import styles from './Home.css';


export default class Home extends Component {
  render() {
    return (
      <div>
        <Login/>
        <LandingPageContent/>
        <hr/>
        <Footer/>
      </div>
    );
  }
}
