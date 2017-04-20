import React, { Component, PropTypes } from 'react';
import Section from './Section';
import APPercentageList from '../components/APPercentageList';
import {
  PRIMARY_PROGRAMS,
  SECONDARY_PROGRAMS,
  PROGRAM,
  PROGRAM_PERCENTAGE
} from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

const PrimaryProgramList = APPercentageList(PRIMARY_PROGRAMS, PROGRAM, PROGRAM_PERCENTAGE, 'Primary Program');
const SecondaryProgramList = APPercentageList(SECONDARY_PROGRAMS, PROGRAM, PROGRAM_PERCENTAGE, 'Secondary Program');

/**
 * Activity Preview Locations section
 * @author Nadejda Mandrescu
 */
class APProgram extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired // eslint-disable-line
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    // TODO replace with possible values trn name for the list
    const primaryProgramList = <PrimaryProgramList key="primary-programs-list" {...this.props} />;
    const secondaryProgramList = <SecondaryProgramList key="secondary-programs-list" {...this.props} />;

    const content = [primaryProgramList, secondaryProgramList].filter(el => el !== undefined);
    return <div>{content}</div>;
  }

}

export default Section(APProgram, 'Program');
