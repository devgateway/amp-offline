import React, { Component } from 'react';
import styles from './ActivityPreview.css';
import * as AC from '../../../utils/constants/ActivityConstants';
import APIdentification from './sections/APIdentification';
import { APInternalIds } from './sections/APInternalIds';
import APPlanning from './sections/APPlanning';
import APLocation from './sections/APLocation';
import APNationalPlanObjective from './sections/APNationalPlanObjective';
import APProgram from './sections/APProgram';
import APSector from './sections/APSector';
import { APProposedProjectCost, APRevisedProjectCost } from './sections/APProjectCost';
import APFundingSources from './sections/APFundingSources';
import LoggerManager from '../../../modules/util/LoggerManager';
import APFundingSection from './sections/funding/APFundingSection';
import APRelatedOrganizations from './sections/APRelatedOrganizations';

/**
 * Main content
 * @author Nadejda Mandrescu
 */
export default class MainGroup extends Component {

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    // TODO (iteration 2+) hide sections that are not directly connected to a single field (e.g. planning, program)
    return (<div className={styles.main_group_container}>
      <APIdentification />
      <APInternalIds sectionPath={AC.ACTIVITY_INTERNAL_IDS} />
      <APPlanning />
      <APLocation sectionPath={AC.LOCATIONS} />
      <APNationalPlanObjective sectionPath={AC.NATIONAL_PLAN_OBJECTIVE} />
      <APProgram />
      <APSector />
      <APProposedProjectCost sectionPath={AC.PPC_AMOUNT} />
      <APRevisedProjectCost sectionPath={AC.RPC_AMOUNT} />
      <APRevisedProjectCost sectionPath={AC.RPC_AMOUNT} />
      <APFundingSources />
      <APFundingSection />
      <APRelatedOrganizations />
    </div>);
  }
}
