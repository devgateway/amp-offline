import * as FMC from './FeatureManagerConstants';
import { capitalize } from '../Utils';

/**
 * @author Nadejda Mandrescu
 */

// Activity fields
export const ACTIVITY_BUDGET = 'activity_budget';
export const ACTIVITY_STATUS = 'activity_status';
export const STATUS_REASON = 'status_reason';
export const FINANCIAL_INSTRUMENT = 'financial_instrument';
export const TYPE_OF_IMPLEMENTATION = 'type_of_implementation';
export const OBJECTIVE = 'objective';
export const RESULTS = 'results';
export const BUDGET_CODE_PROJECT_ID = 'budget_code_project_id';
export const ACTUAL_APPROVAL_DATE = 'actual_approval_date';
export const FUNDINGS = 'fundings';
export const FUNDING_DONOR_ORG_ID = 'donor_organization_id';
export const IS_DRAFT = 'is_draft';
export const ORG_ROLE_ORG_ID = 'organization';
export const ADDITIONAL_INFO = 'additional_info';
export const PRIMARY_SECTORS = 'primary_sectors';
export const SECONDARY_SECTORS = 'secondary_sectors';
export const TERTIARY_SECTORS = 'tertiary_sectors';
export const TAG_SECTORS = 'tag_sectors';
export const SECTOR = 'sector';
export const SECTOR_PERCENTAGE = 'sector_percentage';
export const FINANCING_INSTRUMENT = 'financing_instrument';
export const MODALITIES = 'modalities';
export const LINE_MINISTRY_RANK = 'line_ministry_rank';
export const GOVERNMENT_AGREEMENT_NUMBER = 'government_agreement_number';
export const FUNDING_STATUS = 'funding_status';
export const LOCATIONS = 'locations';
export const LOCATION = 'location';
export const LOCATION_PERCENTAGE = 'location_percentage';
export const IMPLEMENTATION_LOCATION = 'implementation_location';
export const IMPLEMENTATION_LEVEL = 'implementation_level';
export const APPROVAL_STATUS = 'approval_status';
export const APPROVED_BY = 'approved_by';
export const APPROVAL_DATE = 'approval_date';
export const TYPE_OF_ASSISTANCE = 'type_of_assistance';
export const EXPENDITURE_CLASS = 'expenditure_class';
export const FUNDING_DETAILS = 'funding_details';
export const MODE_OF_PAYMENT = 'mode_of_payment';
export const FUNDING_CLASSIFICATION_DATE = 'funding_classification_date';
export const AGREEMENT = 'agreement';
export const DONOR_OBJECTIVE = 'donor_objective';
export const CONDITIONS = 'conditions';
export const AGREEMENT_CODE = 'code';
export const AGREEMENT_TITLE = 'title';
export const PROJECT_CATEGORY = 'project_category';
export const PROJECT_IMPLEMENTING_UNIT = 'project_implementing_unit';
export const ORGANIZATION = 'organization';
export const PERCENTAGE = 'percentage';
export const AMP_ORGANIZATION_ROLE_ID = 'amp_organization_role_id';
export const ROLE = 'role';
export const EXECUTING_AGENCY = 'executing_agency';
export const CONTRACTING_AGENCY = 'contracting_agency';
export const BENEFICIARY_AGENCY = 'beneficiary_agency';
export const IMPLEMENTING_AGENCY = 'implementing_agency';
export const RESPONSIBLE_ORGANIZATION = 'responsible_organization';
export const DONOR_ORGANIZATION = 'donor_organization';
export const REGIONAL_GROUP = 'regional_group';
export const SECTOR_GROUP = 'sector_group';
export const BUDGETS = 'budgets';
export const BUDGET_CODE = 'budget_code';
export const BUDGET_ORGANIZATION_CODE = 'budget_organization_code';
export const ARCHIVED = 'archived';
export const TRANSACTION_DATE = 'transaction_date';
export const TRANSACTION_TYPE = 'transaction_type';
export const COMMITMENTS = 'commitments';
export const DISBURSEMENTS = 'disbursements';
export const EXPENDITURES = 'expenditures';
export const ESTIMATED_DISBURSEMENTS = 'estimated_disbursements';
export const TRANSACTION_AMOUNT = 'transaction_amount';
export const ADJUSTMENT_TYPE = 'adjustment_type';
export const ACTUAL_START_DATE = 'actual_start_date';
export const PROPOSED_START_DATE = 'proposed_start_date';
export const ACTUAL_COMPLETION_DATE = 'actual_completion_date';
export const CONTRACTING_DATE = 'contracting_date';
export const DISBURSEMENT_DATE = 'disbursement_date';
export const PROPOSED_APPROVAL_DATE = 'proposed_approval_date';
export const ORIGINAL_COMPLETION_DATE = 'original_completion_date';
export const PROPOSED_COMPLETION_DATE = 'proposed_completion_date';
export const FINAL_DATE_FOR_DISBURSEMENTS = 'final_date_for_disbursements';
export const FINAL_DATE_FOR_CONTRACTING = 'final_date_for_contracting';
export const EFFECTIVE_FUNDING_DATE = 'effective_funding_date';
export const FUNDING_CLOSING_DATE = 'funding_closing_date';
export const RATIFICATION_DATE = 'ratification_date';
export const MATURITY = 'maturity';
export const LAST_AUDIT_DATE = 'last_audit_date';
export const SIGNATURE_DATE = 'signature_date';
export const HUMANITARIAN_AID = 'humanitarian_aid';
export const DISASTER_RESPONSE = 'disaster_response';
export const PROGRAM = 'program';
export const PROGRAM_PERCENTAGE = 'program_percentage';
export const PROGRAM_SETTINGS = 'program_settings';
export const NATIONAL_PLAN_OBJECTIVE = 'national_plan_objective';
export const PRIMARY_PROGRAMS = 'primary_programs';
export const SECONDARY_PROGRAMS = 'secondary_programs';
export const TERTIAR_PROGRAMS = 'tertiary_programs';
export const GOVERNMENT_APPROVAL_PROCEDURES = 'government_approval_procedures';
export const JOINT_CRITERIA = 'joint_criteria';
export const TEAM = 'team';
export const REJECTED_ID = 'rejectedId';
export const INTERNAL_ID = 'internal_id';
export const AMP_ID = 'amp_id';
export const PROJECT_TITLE = 'project_title';
export const DESCRIPTION = 'description';
export const MODIFIED_BY = 'modified_by';
export const MODIFIED_ON = 'update_date';
export const CREATED_BY = 'created_by';
export const CREATED_ON = 'creation_date';
export const LAST_IMPORTED_BY = 'last_imported_by';
export const CLIENT_CHANGE_ID = 'client-change-id';
export const CLIENT_CREATED_ON = 'client-created-on';
export const CLIENT_UPDATED_ON = 'client-updated-on';
export const IS_PUSHED = 'is-pushed';
export const ACTIVITY_GROUP = 'activity_group';
export const VERSION = 'version';
export const PROJECT_COMMENTS = 'project_comments';
export const LESSONS_LEARNED = 'lessons_learned';
export const PROJECT_IMPACT = 'project_impact';
export const ACTIVITY_SUMMARY = 'activity_summary';
export const CONDITIONALITIES = 'conditionalities';
export const PROJECT_MANAGEMENT = 'project_management';
export const A_C_CHAPTER = 'a_c_chapter';
export const CRIS_NUMBER = 'cris_number';
export const IATI_IDENTIFIER = 'iati_identifier';
export const ACTIVITY_INTERNAL_IDS = 'activity_internal_ids';
export const HIERARCHICAL_VALUE = 'hierarchical_value';
export const HIERARCHICAL_VALUE_PARTS = 'hierarchical_value_parts';
export const HIERARCHICAL_VALUE_DEPTH = 'hierarchical_value_depth';
export const PPC_AMOUNT = 'ppc_amount';
export const RPC_AMOUNT = 'rpc_amount';
export const PPC_ANNUAL_BUDGETS = 'ppc_annual_budgets';
export const AMOUNT = 'amount';
export const CURRENCY = 'currency';
export const FUNDING_DATE = 'funding_date';
export const COMPONENTS = 'components';
export const TOTAL_NUMBER_OF_FUNDING_SOURCES = 'total_number_of_funding_sources';
export const SOURCE_ROLE = 'source_role';
export const AMP_FUNDING_ID = 'funding_id';
export const ISSUES = 'issues';
export const ISSUE_DATE = 'issue_date';
export const ISSUE_NAME = 'name';
export const MEASURES = 'measures';
export const MEASURE_NAME = 'name';
export const MEASURE_DATE = 'measure_date';
export const ACTORS = 'actors';
export const ACTOR_NAME = 'name';
export const STRUCTURES = 'structures';
export const STRUCTURES_TITLE = 'title';
export const STRUCTURES_DESCRIPTION = 'description';
export const STRUCTURES_LATITUDE = 'latitude';
export const STRUCTURES_LONGITUDE = 'longitude';
export const STRUCTURES_COLOR = 'structure_color';
export const STRUCTURES_LAT = 'lat';
export const STRUCTURES_LNG = 'lng';
export const STRUCTURES_SHAPE = 'shape';
export const STRUCTURES_POINT = 'Point';
export const STRUCTURES_POLYGON = 'Polygon';
export const STRUCTURES_POLYLINE = 'Polyline';
export const STRUCTURES_COORDINATES = 'coordinates';
export const COMPONENT_TYPE = 'component_type';
export const COMPONENT_TITLE = 'component_title';
export const COMPONENT_FUNDING = 'funding';
export const COMPONENT_DESCRIPTION = 'description';
export const COMPONENT_ORGANIZATION = 'component_organization';
export const FUNDING_AMOUNT_ID = 'amp_funding_amount_id';
export const EXTRA_INFO = 'extra_info';
export const VALUE = 'value';
export const ACRONYM = 'acronym';
export const TYPE_OF_COOPERATION = 'type_of_cooperation';
export const ANNUAL_PROJECT_BUDGET_ID = 'annual_project_budget_id';
export const TYPE = 'type';
export const YEAR = 'year';
export const GROUP_VERSIONED_FUNDING = 'group_versioned_funding';
export const ACTIVE_LIST = 'active_list';
export const ACTIVE = 'active';
export const DELEGATED_COOPERATION = 'delegated_cooperation';
export const DELEGATED_PARTNER = 'delegated_partner';
export const FINANCING_ID = 'financing_id';
export const DISBURSEMENT_ORDER_ID = 'disbursement_order_id';
export const PLEDGE = 'pledge';
export const CAPITAL_SPENDING_PERCENTAGE = 'capital_spending_percentage';
export const REPORTING_DATE = 'reporting_date';
export const RECIPIENT_ROLE = 'recipient_role';
export const RECIPIENT_ORGANIZATION = 'recipient_organization';
export const TEMPORAL_ID = '_temporal_id';
export const MINISTRY_CODE = 'ministry_code';
export const PROJECT_CODE = 'project_code';
export const FY = 'fy';
export const INDIRECT_ON_BUDGET = 'indirect_on_budget';
export const IMPLEMENTATION_LEVELS_EXTRA_INFO = 'implementation-levels';
export const IMPLEMENTATION_LOCATION_EXTRA_INFO = 'implementation_location_name';
export const DONOR_CONTACT = 'donor_contact_information';
export const PROJECT_COORDINATOR_CONTACT = 'project_coordinator_contact_information';
export const SECTOR_MINISTRY_CONTACT = 'sector_ministry_contact_information';
export const MOFED_CONTACT = 'mofed_contact_information';
export const IMPLEMENTING_EXECUTING_AGENCY_CONTACT = 'implementing/executing_agency_contact_information';
export const CONTACT = 'contact';
export const ORGANIZATION_GROUP = 'organization_group';
export const FIXED_EXCHANGE_RATE = 'fixed_exchange_rate';
export const PRIMARY_CONTACT = 'mark_as_primary';
export const ACTIVITY_DOCUMENTS = 'activity_documents';
export const DOCUMENT_TYPE = 'document_type';
export const ISO2 = 'iso2';
export const MTEF_PROJECTIONS = 'mtef_projections';
export const PROJECTION = 'projection';
export const PIPELINE = 'pipeline';
export const PROJECTION_DATE = 'projection_date';

// Activity labels (usually those that don't come as part of Fields Def EP)
export const SAME_AS_PROPOSED_START_DATE_LABEL = 'Same as Proposed Start Date';
export const SAME_AS_PROPOSED_APPROVAL_DATE_LABEL = 'Same as Proposed Approval Date';

// Activity validation rules
export const DEPENDENCY_IMPLEMENTATION_LEVEL_PRESENT = 'implementation_level_present';
export const DEPENDENCY_IMPLEMENTATION_LEVEL_VALID = 'implementation_level_valid';
export const DEPENDENCY_IMPLEMENTATION_LOCATION_PRESENT = 'implementation_location_present';
export const DEPENDENCY_IMPLEMENTATION_LOCATION_VALID = 'implementation_location_valid';
export const DEPENDENCY_PROJECT_CODE_ON_BUDGET = 'project_code_on_budget';
export const DEPENDENCY_ON_BUDGET = 'on_budget';
export const DEPENDENCY_TRANSACTION_PRESENT = 'transaction_present';
export const DEPENDENCY_COMPONENT_FUNDING_ORG_VALID = 'organization_present';

/** IDs for AP sections **/
export const AP_SECTION_IDS =
  [{ key: 'APIdentification', hash: '#APIdentification', value: 'Identification', fmPath: FMC.ACTIVITY_IDENTIFICATION },
    { key: 'APInternalIds', hash: '#APInternalIds', value: 'Agency Internal IDs', sectionPath: ACTIVITY_INTERNAL_IDS },
    { key: 'APPlanning', hash: '#APPlanning', value: 'Planning', fmPath: FMC.ACTIVITY_PLANNING },
    { key: 'APLocation', hash: '#APLocation', value: 'Location', sectionPath: LOCATIONS },
    { key: 'APProgram', hash: '#APProgram', value: 'Program', fmPath: FMC.ACTIVITY_PROGRAM },
    { key: 'APSector', hash: '#APSector', value: 'Sectors', fmPath: FMC.ACTIVITY_SECTORS },
    {
      key: 'APFundingSources',
      hash: '#APFundingSources',
      value: 'Funding Sources',
      sectionPath: TOTAL_NUMBER_OF_FUNDING_SOURCES
    },
    { key: 'APFunding', hash: '#APFunding', value: 'Funding', sectionPath: FUNDINGS },
    {
      key: 'APRelatedOrganizations',
      hash: '#APRelatedOrganizations',
      value: 'Related Organizations',
      fmPath: FMC.ACTIVITY_ORGANIZATIONS
    },
    { key: 'APIssues', hash: '#APIssues', value: 'Issues', sectionPath: ISSUES },
    { key: 'APContact', hash: '#APContact', value: 'Contact Information', fmPath: FMC.ACTIVITY_CONTACT },
    { key: 'APStructures', hash: '#APStructures', value: 'Structures', sectionPath: STRUCTURES },
    { key: 'APDocument', hash: '#APDocument', value: 'Related Documents', sectionPath: ACTIVITY_DOCUMENTS },
  ];

/** Column counts for each section **/
export const ACTIVITY_INTERNAL_IDS_COLS = 3;
export const ACTIVITY_PLANNING_COLS = 2;
export const ACTIVITY_LOCATION_COLS = 3;
export const ACTIVITY_FUNDING_COLS = 2;
export const ACTIVITY_CONTACT_COLS = 2;
export const AP_FUNDINGS_TABLE_COLS = 4;

export const MULTI_SELECT_MIN_SIZE = 8;
export const MULTI_SELECT_MAX_SIZE = 8;

export function toFieldNames(listOfNames) {
  return listOfNames.map(name => toFieldName(name));
}

/**
 * Converts the original non-translated label to internal field name
 * @param name
 * @return {string}
 */
export function toFieldName(name: string) {
  return name.toLowerCase().replace(' ', '_');
}

/**
 * Converts the internal field name to the Original non-translated label
 * @param fieldName
 * @return {string}
 */
export function toOriginalLabel(fieldName: string) {
  return capitalize(fieldName.replace('_', ' '));
}
