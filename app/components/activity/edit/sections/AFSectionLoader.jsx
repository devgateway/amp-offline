import React from 'react';
import * as SC from './AFSectionConstants';
import Identification from './Identification';
import ActivityInternalIds from './ActivityInternalIds';
import Planning from './Planning';
import Location from './Location';
import Programs from './Programs';
import Sectors from './Sectors';
import Organizations from './Organizations';
import Funding from './Funding';
import Components from './Components';

/**
 * Loads AF section
 * @param sectionName
 * @return {string|AFSection}
 */
const loadSection = (sectionName) => {
  switch (sectionName) {
    case SC.IDENTIFICATION:
      return <Identification name={sectionName} />;
    case SC.ACTIVITY_INTERNAL_IDS:
      return <ActivityInternalIds name={sectionName} />;
    case SC.PLANNING:
      return <Planning name={sectionName} />;
    case SC.LOCATION:
      return <Location name={sectionName} />;
    case SC.PROGRAM:
      return <Programs name={sectionName} />;
    case SC.SECTORS:
      return <Sectors name={sectionName} />;
    case SC.ORGANIZATIONS:
      return <Organizations name={sectionName} />;
    case SC.FUNDING:
      return <Funding name={sectionName} />;
    case SC.COMPONENTS:
      return <Components name={sectionName} />;
    default:
      return 'Not Implemented';
  }
};

export default loadSection;
