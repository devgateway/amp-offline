import * as AC from '../../../../utils/constants/ActivityConstants';
import * as FC from '../../../../utils/constants/FieldPathConstants';
import * as FMC from '../../../../utils/constants/FeatureManagerConstants';

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
export const AID_EFFECTIVENESS = 'Aid Effectiveness';

// TODO add sections FM check, for now returing only Niger enabled sections
export const SECTIONS = [
  IDENTIFICATION,
  ACTIVITY_INTERNAL_IDS,
  PLANNING, LOCATION,
  PROGRAM,
  SECTORS,
  ORGANIZATIONS,
  FUNDING,
  CONTACTS,
  ISSUES_SECTION
  /*
  COMPONENTS,
  STRUCTURES,
  M_E,
  RELATED_DOCUMENTS */
];

export const SECTIONS_FM_PATH = {};
SECTIONS_FM_PATH[IDENTIFICATION] = FMC.ACTIVITY_IDENTIFICATION;
SECTIONS_FM_PATH[ACTIVITY_INTERNAL_IDS] = AC.ACTIVITY_INTERNAL_IDS;
SECTIONS_FM_PATH[PLANNING] = FMC.ACTIVITY_PLANNING;
SECTIONS_FM_PATH[LOCATION] = AC.LOCATIONS;
SECTIONS_FM_PATH[PROGRAM] = FMC.ACTIVITY_PROGRAM;
SECTIONS_FM_PATH[SECTORS] = FMC.ACTIVITY_SECTORS;
SECTIONS_FM_PATH[ORGANIZATIONS] = FMC.ACTIVITY_ORGANIZATIONS;
SECTIONS_FM_PATH[FUNDING] = AC.FUNDINGS;
SECTIONS_FM_PATH[COMPONENTS] = AC.COMPONENTS;
SECTIONS_FM_PATH[STRUCTURES] = null;
SECTIONS_FM_PATH[ISSUES_SECTION] = AC.ISSUES;
SECTIONS_FM_PATH[CONTACTS] = FMC.ACTIVITY_CONTACT;
SECTIONS_FM_PATH[M_E] = null;
SECTIONS_FM_PATH[RELATED_DOCUMENTS] = null;

/** stores field paths roots only to link to the section and use this mapping for validation error */
export const FIELDS_PER_SECTIONS = {};
FIELDS_PER_SECTIONS[IDENTIFICATION] = new Set([AC.PROJECT_TITLE, AC.ACTIVITY_STATUS, AC.STATUS_REASON, AC.OBJECTIVE,
  AC.LESSONS_LEARNED, AC.PROJECT_IMPACT, AC.ACTIVITY_SUMMARY, AC.ACTIVITY_BUDGET, AC.MINISTRY_CODE]);
FIELDS_PER_SECTIONS[ACTIVITY_INTERNAL_IDS] = new Set([AC.ACTIVITY_INTERNAL_IDS]);
FIELDS_PER_SECTIONS[PLANNING] = new Set([AC.LINE_MINISTRY_RANK, AC.ORIGINAL_COMPLETION_DATE, AC.PROPOSED_APPROVAL_DATE,
  AC.PROPOSED_COMPLETION_DATE, AC.ACTUAL_APPROVAL_DATE, AC.FINAL_DATE_FOR_DISBURSEMENTS, AC.FINAL_DATE_FOR_CONTRACTING,
  AC.ACTUAL_COMPLETION_DATE, AC.PROPOSED_START_DATE, AC.ACTUAL_START_DATE]);
FIELDS_PER_SECTIONS[LOCATION] = new Set([AC.IMPLEMENTATION_LEVEL, AC.IMPLEMENTATION_LOCATION, AC.LOCATIONS]);
FIELDS_PER_SECTIONS[PROGRAM] = new Set([AC.NATIONAL_PLAN_OBJECTIVE, AC.PRIMARY_PROGRAMS, AC.SECONDARY_PROGRAMS]);
FIELDS_PER_SECTIONS[SECTORS] = new Set([AC.PRIMARY_SECTORS, AC.SECONDARY_SECTORS, AC.TERTIARY_SECTORS]);
// TODO AMPOFFLINE-456 remove components used here as a workaround to report errors
FIELDS_PER_SECTIONS[ORGANIZATIONS] = new Set([AC.DONOR_ORGANIZATION, AC.RESPONSIBLE_ORGANIZATION, AC.EXECUTING_AGENCY,
  AC.IMPLEMENTING_AGENCY, AC.BENEFICIARY_AGENCY, AC.CONTRACTING_AGENCY, AC.COMPONENTS]);
FIELDS_PER_SECTIONS[FUNDING] = new Set([AC.FUNDINGS, AC.TOTAL_NUMBER_OF_FUNDING_SOURCES, AC.TYPE_OF_COOPERATION,
  AC.TYPE_OF_IMPLEMENTATION, AC.MODALITIES, AC.PPC_AMOUNT, AC.PPC_ANNUAL_BUDGETS, AC.RPC_AMOUNT]);
FIELDS_PER_SECTIONS[COMPONENTS] = new Set([]);
FIELDS_PER_SECTIONS[STRUCTURES] = new Set([]);
FIELDS_PER_SECTIONS[ISSUES_SECTION] = new Set([AC.ISSUES, AC.MEASURES, AC.ACTORS]);
FIELDS_PER_SECTIONS[CONTACTS] = new Set(FC.ACTIVITY_CONTACT_PATHS);
FIELDS_PER_SECTIONS[M_E] = new Set([]);
FIELDS_PER_SECTIONS[RELATED_DOCUMENTS] = new Set([]);
