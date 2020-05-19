import React from 'react';
import * as SC from './AFSectionConstants';
import AFIdentification from './AFIdentification';
import AFActivityInternalIds from './AFActivityInternalIds';
import Planning from './AFPlanning';
import AFLocation from './AFLocation';
import AFPrograms from './AFPrograms';
import AFSectors from './AFSectors';
import AFOrganizations from './AFOrganizations';
import AFFunding from './AFFunding';
import AFIssues from './AFIssues';
import AFLineMinistryObservations from './AFLineMinistryObservations';
import { AFContactsPage } from '../../../../containers/ContactPage';
import AFStructures from './AFStructures';
import { AFDocumentPage } from '../../../../containers/ResourcePage';

/**
 * Loads AF section
 * @param sectionName
 * @return {string|AFSection}
 */
const loadSection = (sectionName) => {
  switch (sectionName) {
    case SC.IDENTIFICATION:
      return <AFIdentification />;
    case SC.ACTIVITY_INTERNAL_IDS:
      return <AFActivityInternalIds />;
    case SC.PLANNING:
      return <Planning />;
    case SC.SECTORS:
      return <AFSectors />;
    case SC.PROGRAM:
      return <AFPrograms />;
    case SC.ORGANIZATIONS:
      return <AFOrganizations />;
    case SC.FUNDING:
      return <AFFunding />;
    case SC.LOCATION:
      return <AFLocation />;
    case SC.STRUCTURES:
      return <AFStructures />;
    case SC.ISSUES_SECTION:
      return <AFIssues />;
    case SC.CONTACTS:
      return <AFContactsPage />;
    case SC.RELATED_DOCUMENTS:
      return <AFDocumentPage />;
    case SC.LINE_MINISTRY_OBSERVATIONS:
      return <AFLineMinistryObservations />;
    /*
    case SC.COMPONENTS:
      return <AFComponents />;
    */
    default:
      return 'Not Implemented';
  }
};

export default loadSection;
