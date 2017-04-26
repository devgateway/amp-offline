import * as AC from '../../../../utils/constants/ActivityConstants';

export const IDENTIFICATION = 'Identification';
export const ACTIVITY_INTERNAL_IDS = 'Activity Internal IDs';
export const PLANNING = 'Planning';
export const LOCATION = 'Location';
export const PROGRAM = 'Program';
export const CROSS_CUTTING_ISSUES = 'Cross Cutting Issues';
export const SECTORS = 'Sectors';
export const ORGANIZATIONS = 'Organizations';
export const FUNDING = 'Funding';
export const REGIONAL_FUNDING = 'Regional Funding';
export const COMPONENTS = 'Components';
export const STRUCTURES = 'Structures';
export const ISSUES_SECTION = 'Issues Section';
export const REGIONAL_OBSERVATIONS = 'Regional Observations';
export const CONTACTS = 'Contacts';
export const CONTRACTS = 'Contracts';
export const M_E = 'M&E';
export const PARIS_INDICATORS = 'Paris Indicators';
export const RELATED_DOCUMENTS = 'Related Documents';
export const LINE_MINISTRY_OBSERVATIONS = 'Line Ministry Observations';
export const BUDGET_STRUCTURE = 'Budget Structure';
export const GPI = 'GPI';
// TODO fix name and translation
export const AID_EFFECTIVENESS = 'Aid Effectivenes';

// TODO add sections FM check, for now returing only Niger enabled sections
export const SECTIONS = [
  IDENTIFICATION,
  ACTIVITY_INTERNAL_IDS,
  PLANNING, LOCATION,
  PROGRAM,
  SECTORS,
  ORGANIZATIONS,
  FUNDING,
  COMPONENTS,
  STRUCTURES,
  ISSUES_SECTION,
  CONTACTS,
  M_E,
  RELATED_DOCUMENTS
];

export const SECTIONS_FM_PATH = {};
SECTIONS_FM_PATH[IDENTIFICATION] = null;
SECTIONS_FM_PATH[ACTIVITY_INTERNAL_IDS] = AC.ACTIVITY_INTERNAL_IDS;
SECTIONS_FM_PATH[PLANNING] = null;
SECTIONS_FM_PATH[LOCATION] = AC.LOCATIONS;
SECTIONS_FM_PATH[PROGRAM] = null;
SECTIONS_FM_PATH[SECTORS] = null;
SECTIONS_FM_PATH[ORGANIZATIONS] = null;
SECTIONS_FM_PATH[FUNDING] = AC.FUNDINGS;
SECTIONS_FM_PATH[COMPONENTS] = AC.COMPONENTS;
SECTIONS_FM_PATH[STRUCTURES] = null;
SECTIONS_FM_PATH[ISSUES_SECTION] = null;
SECTIONS_FM_PATH[CONTACTS] = null;
SECTIONS_FM_PATH[M_E] = null;
SECTIONS_FM_PATH[RELATED_DOCUMENTS] = null;
