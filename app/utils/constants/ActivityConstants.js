import * as ValueConstants from './ValueConstants';

/**
 * @author Nadejda Mandrescu
 */

export const ORG_ROLE_FIELDS = toFieldNames(ValueConstants.ORG_ROLE_NAMES);

// Activity fields
export const ACTIVITY_BUDGET = 'activity_budget';
export const ACTIVITY_STATUS = 'activity_status';
export const STATUS_REASON = 'status_reason';
export const OBJECTIVE = 'objective';
export const ACTUAL_APPROVAL_DATE = 'actual_approval_date';
export const FUNDINGS = 'fundings';
export const FUNDING_DONOR_ORG_ID = 'donor_organization_id';
export const IS_DRAFT = 'is_draft';
export const ORG_ROLE_ORG_ID = 'organisation';
export const PRIMARY_SECTORS = 'primary_sectors';
export const SECONDARY_SECTORS = 'secondary_sectors';
export const TERTIARY_SECTORS = 'tertiary_sectors';
export const TAG_SECTORS = 'tag_sectors';
export const SECTOR_ID = 'sector_id';
export const SECTOR_PERCENTAGE = 'sector_percentage';
export const FINANCING_INSTRUMENT = 'financing_instrument';
export const MODALITIES = 'modalities';
export const LINE_MINISTRY_RANK = 'line_ministry_rank';
export const FUNDING_STATUS = 'funding_status';
export const LOCATIONS = 'locations';
export const LOCATION = 'location';
export const LOCATION_PERCENTAGE = 'location_percentage';
export const IMPLEMENTATION_LOCATION = 'implementation_location';
export const IMPLEMENTATION_LEVEL = 'implementation_level';
export const APPROVAL_STATUS = 'approval_status';
export const TYPE_OF_ASSISTANCE = 'type_of_assistance';
export const EXPENDITURE_CLASS = 'expenditure_class';
export const FUNDING_DETAILS = 'funding_details';
export const MODE_OF_PAYMENT = 'mode_of_payment';
export const PROJECT_CATEGORY = 'project_category';
export const PROJECT_IMPLEMENTING_UNIT = 'project_implementing_unit';
export const ORGANIZATION = 'organization';
export const AMP_ORGANIZATION_ROLE_ID = 'amp_organization_role_id';
export const ROLE = 'role';
export const EXECUTING_AGENCY = 'executing_agency';
export const CONTRACTING_AGENCY = 'contracting_agency';
export const BENEFICIARY_AGENCY = 'beneficiary_agency';
export const IMPLEMENTING_AGENCY = 'implementing_agency';
export const RESPONSIBLE_ORGANIZATION = 'responsible_organization';
export const DONOR_ORGANIZATION = 'donor_organization';
export const ARCHIVED = 'archived';
export const TRANSACTION_DATE = 'transaction_date';
export const TRANSACTION_TYPE = 'transaction_type';
export const TRANSACTION_AMOUNT = 'transaction_amount';
export const ADJUSTMENT_TYPE = 'adjustment_type';
export const ACTUAL_START_DATE = 'actual_start_date';
export const PROPOSED_START_DATE = 'proposed_start_date';
export const ACTUAL_COMPLETION_DATE = 'actual_completion_date';
export const CONTRACTING_DATE = 'contracting_date';
export const PROPOSED_APPROVAL_DATE = 'proposed_approval_date';
export const ORIGINAL_COMPLETION_DATE = 'original_completion_date';
export const PROPOSED_COMPLETION_DATE = 'proposed_completion_date';
export const EFFECTIVE_FUNDING_DATE = 'effective_funding_date';
export const FUNDING_CLOSING_DATE = 'funding_closing_date';
export const HUMANITARIAN_AID = 'humanitarian_aid';
export const DISASTER_RESPONSE = 'disaster_response';
export const PROGRAM = 'program';
export const PROGRAM_PERCENTAGE = 'program_percentage';
export const PROGRAM_SETTINGS = 'program_settings';
export const NATIONAL_PLAN_OBJECTIVE = 'national_plan_objective';
export const PRIMARY_PROGRAMS = 'primary_programs';
export const SECONDARY_PROGRAMS = 'secondary_programs';
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
export const CLIENT_CHANGE_ID = 'client-change-id';
export const CLIENT_CREATED_ON = 'client-created-on';
export const CLIENT_UPDATED_ON = 'client-updated-on';
export const PROJECT_COMMENTS = 'project_comments';
export const LESSONS_LEARNED = 'lessons_learned';
export const PROJECT_IMPACT = 'project_impact';
export const ACTIVITY_SUMMARY = 'activity_summary';
export const CONDITIONALITIES = 'conditionalities';
export const PROJECT_MANAGEMENT = 'project_management';
export const A_C_CHAPTER = 'a_c_chapter';
export const ACTIVITY_INTERNAL_IDS = 'activity_internal_ids';
export const HIERARCHICAL_VALUE = 'hierarchical_value';
export const HIERARCHICAL_VALUE_PARTS = 'hierarchical_value_parts';
export const HIERARCHICAL_VALUE_DEPTH = 'hierarchical_value_depth';
export const PPC_AMOUNT = 'ppc_amount';
export const RPC_AMOUNT = 'rpc_amount';
export const AMOUNT = 'amount';
export const CURRENCY_CODE = 'currency_code';
export const CURRENCY = 'currency';
export const FUNDING_DATE = 'funding_date';
export const COMPONENTS = 'components';
export const TOTAL_NUMBER_OF_FUNDING_SOURCES = 'total_number_of_funding_sources';
export const SOURCE_ROLE = 'source_role';

export function toFieldNames(listOfNames) {
  return listOfNames.map(name => toFieldName(name));
}

export function toFieldName(name) {
  return name.toLowerCase().replace(' ', '_');
}

