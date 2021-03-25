import { ActivityConstants, FeatureManagerConstants, FieldPathConstants } from 'amp-ui';

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
  PLANNING,
  SECTORS,
  PROGRAM,
  ORGANIZATIONS,
  FUNDING,
  LOCATION,
  REGIONAL_FUNDING,
  STRUCTURES,
  ISSUES_SECTION,
  CONTACTS,
  RELATED_DOCUMENTS,
  M_E,
  LINE_MINISTRY_OBSERVATIONS
  /*
  COMPONENTS,
  M_E,
  */
];

export const SECTIONS_FM_PATH = {};
SECTIONS_FM_PATH[IDENTIFICATION] = FeatureManagerConstants.ACTIVITY_IDENTIFICATION;
SECTIONS_FM_PATH[ACTIVITY_INTERNAL_IDS] = ActivityConstants.ACTIVITY_INTERNAL_IDS;
SECTIONS_FM_PATH[PLANNING] = FeatureManagerConstants.ACTIVITY_PLANNING;
SECTIONS_FM_PATH[LOCATION] = ActivityConstants.LOCATIONS;
SECTIONS_FM_PATH[PROGRAM] = FeatureManagerConstants.ACTIVITY_PROGRAM;
SECTIONS_FM_PATH[SECTORS] = FeatureManagerConstants.ACTIVITY_SECTORS;
SECTIONS_FM_PATH[ORGANIZATIONS] = FeatureManagerConstants.ACTIVITY_ORGANIZATIONS;
SECTIONS_FM_PATH[FUNDING] = ActivityConstants.FUNDINGS;
SECTIONS_FM_PATH[COMPONENTS] = ActivityConstants.COMPONENTS;
SECTIONS_FM_PATH[STRUCTURES] = FeatureManagerConstants.ACTIVITY_STRUCTURES;
SECTIONS_FM_PATH[ISSUES_SECTION] = ActivityConstants.ISSUES;
SECTIONS_FM_PATH[CONTACTS] = FeatureManagerConstants.ACTIVITY_CONTACT;
SECTIONS_FM_PATH[M_E] = FeatureManagerConstants.ME;
SECTIONS_FM_PATH[RELATED_DOCUMENTS] = ActivityConstants.ACTIVITY_DOCUMENTS;
SECTIONS_FM_PATH[REGIONAL_FUNDING] = FeatureManagerConstants.ACTIVITY_REGIONAL_FUNDING;
SECTIONS_FM_PATH[LINE_MINISTRY_OBSERVATIONS] = ActivityConstants.LINE_MINISTRY_OBSERVATIONS;

/** stores field paths roots only to link to the section and use this mapping for validation error */
export const FIELDS_PER_SECTIONS = {};
FIELDS_PER_SECTIONS[IDENTIFICATION] = new Set([ActivityConstants.PROJECT_TITLE, ActivityConstants.ACTIVITY_STATUS,
  ActivityConstants.STATUS_REASON, ActivityConstants.OBJECTIVE, ActivityConstants.LESSONS_LEARNED,
  ActivityConstants.PROJECT_IMPACT, ActivityConstants.ACTIVITY_SUMMARY, ActivityConstants.ACTIVITY_BUDGET,
  ActivityConstants.MINISTRY_CODE, ActivityConstants.PROJECT_COMMENTS,
  ActivityConstants.DESCRIPTION, ActivityConstants.RESULTS, ActivityConstants.BUDGET_CODE_PROJECT_ID,
  ActivityConstants.A_C_CHAPTER, ActivityConstants.GOVERNMENT_APPROVAL_PROCEDURES,
  ActivityConstants.JOINT_CRITERIA, ActivityConstants.HUMANITARIAN_AID, ActivityConstants.FY,
  ActivityConstants.CRIS_NUMBER, ActivityConstants.PROJECT_MANAGEMENT, ActivityConstants.GOVERNMENT_AGREEMENT_NUMBER,
  ActivityConstants.MULTI_STAKEHOLDER_PARTNERSHIP]);
FIELDS_PER_SECTIONS[ACTIVITY_INTERNAL_IDS] = new Set([ActivityConstants.ACTIVITY_INTERNAL_IDS]);
FIELDS_PER_SECTIONS[PLANNING] = new Set([ActivityConstants.LINE_MINISTRY_RANK,
  ActivityConstants.ORIGINAL_COMPLETION_DATE, ActivityConstants.PROPOSED_APPROVAL_DATE,
  ActivityConstants.PROPOSED_COMPLETION_DATE, ActivityConstants.ACTUAL_APPROVAL_DATE,
  ActivityConstants.FINAL_DATE_FOR_DISBURSEMENTS, ActivityConstants.FINAL_DATE_FOR_CONTRACTING,
  ActivityConstants.ACTUAL_COMPLETION_DATE, ActivityConstants.PROPOSED_START_DATE,
  ActivityConstants.ACTUAL_START_DATE]);
FIELDS_PER_SECTIONS[LOCATION] = new Set([ActivityConstants.IMPLEMENTATION_LEVEL,
  ActivityConstants.IMPLEMENTATION_LOCATION, ActivityConstants.LOCATIONS]);
FIELDS_PER_SECTIONS[PROGRAM] = new Set([ActivityConstants.NATIONAL_PLAN_OBJECTIVE,
  ActivityConstants.PRIMARY_PROGRAMS, ActivityConstants.SECONDARY_PROGRAMS]);
FIELDS_PER_SECTIONS[SECTORS] = new Set([ActivityConstants.PRIMARY_SECTORS, ActivityConstants.SECONDARY_SECTORS,
  ActivityConstants.TERTIARY_SECTORS]);
// TODO AMPOFFLINE-456 remove components used here as a workaround to report errors
FIELDS_PER_SECTIONS[ORGANIZATIONS] = new Set([ActivityConstants.DONOR_ORGANIZATION,
  ActivityConstants.RESPONSIBLE_ORGANIZATION, ActivityConstants.EXECUTING_AGENCY,
  ActivityConstants.IMPLEMENTING_AGENCY, ActivityConstants.BENEFICIARY_AGENCY, ActivityConstants.CONTRACTING_AGENCY,
  ActivityConstants.SECTOR_GROUP, ActivityConstants.REGIONAL_GROUP,
  ActivityConstants.COMPONENTS]);
FIELDS_PER_SECTIONS[FUNDING] = new Set([ActivityConstants.FUNDINGS,
  ActivityConstants.TOTAL_NUMBER_OF_FUNDING_SOURCES, ActivityConstants.TYPE_OF_COOPERATION,
  ActivityConstants.TYPE_OF_IMPLEMENTATION, ActivityConstants.MODALITIES, ActivityConstants.PPC_AMOUNT,
  ActivityConstants.PPC_ANNUAL_BUDGETS, ActivityConstants.RPC_AMOUNT, ActivityConstants.MTEF_PROJECTIONS]);
FIELDS_PER_SECTIONS[COMPONENTS] = new Set([]);
FIELDS_PER_SECTIONS[STRUCTURES] = new Set([ActivityConstants.STRUCTURES_SHAPE,
  ActivityConstants.STRUCTURES_LATITUDE, ActivityConstants.STRUCTURES_LONGITUDE,
  ActivityConstants.STRUCTURES_TITLE, ActivityConstants.STRUCTURES_DESCRIPTION, ActivityConstants.STRUCTURES,
  ActivityConstants.STRUCTURES_COORDINATES, ActivityConstants.STRUCTURES_COLOR]);
FIELDS_PER_SECTIONS[ISSUES_SECTION] = new Set([ActivityConstants.ISSUES, ActivityConstants.MEASURES,
  ActivityConstants.ACTORS]);
FIELDS_PER_SECTIONS[CONTACTS] = new Set(FieldPathConstants.ACTIVITY_CONTACT_PATHS);
FIELDS_PER_SECTIONS[M_E] = new Set([ActivityConstants.INDICATORS, ActivityConstants.INDICATOR,
  ActivityConstants.BASE, ActivityConstants.TARGET, ActivityConstants.CURRENT, ActivityConstants.INDICATOR_COMMENT,
  ActivityConstants.INDICATOR_DATE, ActivityConstants.INDICATOR_VALUE]);
FIELDS_PER_SECTIONS[RELATED_DOCUMENTS] = new Set([]);
FIELDS_PER_SECTIONS[REGIONAL_FUNDING] = new Set([ActivityConstants.REGIONAL_FUNDINGS_COMMITMENTS,
  ActivityConstants.REGIONAL_FUNDINGS_DISBURSEMENTS, ActivityConstants.REGIONAL_FUNDINGS_EXPENDITURES]);
FIELDS_PER_SECTIONS[LINE_MINISTRY_OBSERVATIONS] = new Set([ActivityConstants.LINE_MINISTRY_OBSERVATIONS,
  ActivityConstants.MEASURES, ActivityConstants.ACTORS]);
