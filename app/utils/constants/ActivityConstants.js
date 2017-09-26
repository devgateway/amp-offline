import * as ValueConstants from './ValueConstants';
import { capitalize } from '../Utils';

/**
 * @author Nadejda Mandrescu
 */

export const ORG_ROLE_FIELDS = toFieldNames(ValueConstants.ORG_ROLE_NAMES);

// Activity fields
export const ACTIVITY_BUDGET = 'activity_budget';
export const ACTIVITY_STATUS = 'activity_status';
export const STATUS_REASON = 'status_reason';
export const TYPE_OF_IMPLEMENTATION = 'type_of_implementation';
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
export const SECTOR = 'sector';
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
export const FUNDING_CLASSIFICATION_DATE = 'funding_classification_date';
export const AGREEMENT = 'agreement';
export const AGREEMENT_CODE = 'code';
export const AGREEMENT_TITLE = 'title';
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
export const FINAL_DATE_FOR_DISBURSEMENTS = 'final_date_for_disbursements';
export const FINAL_DATE_FOR_CONTRACTING = 'final_date_for_contracting';
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
export const PPC_ANNUAL_BUDGETS = 'ppc_annual_budgets';
export const AMOUNT = 'amount';
export const CURRENCY_CODE = 'currency_code';
export const CURRENCY = 'currency';
export const FUNDING_DATE = 'funding_date';
export const COMPONENTS = 'components';
export const TOTAL_NUMBER_OF_FUNDING_SOURCES = 'total_number_of_funding_sources';
export const SOURCE_ROLE = 'source_role';
export const AMP_FUNDING_ID = 'amp_funding_id';
export const ISSUES = 'issues';
export const ISSUE_DATE = 'issue_date';
export const MEASURES = 'measures';
export const MEASURE_DATE = 'measure_date';
export const ACTORS = 'actors';
export const COMPONENT_TYPE = 'component_type';
export const COMPONENT_TITLE = 'component_title';
export const COMPONENT_FUNDING = 'funding';
export const COMPONENT_DESCRIPTION = 'description';
export const FUNDING_AMOUNT_ID = 'amp_funding_amount_id';
export const EXTRA_INFO = 'extra_info';
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
export const TEMPORAL_ID = '_temporal_id';

// Activity labels (usually those that don't come as part of Fields Def EP)
export const SAME_AS_PROPOSED_START_DATE_LABEL = 'Same as Proposed Start Date';
export const SAME_AS_PROPOSED_APPROVAL_DATE_LABEL = 'Same as Proposed Approval Date';

/** IDs for AP sections **/
export const AP_SECTION_IDS =
  [{ key: 'APIdentification', hash: '#APIdentification', value: 'Identification' },
    { key: 'APInternalIds', hash: '#APInternalIds', value: 'Agency Internal IDs' },
    { key: 'APPlanning', hash: '#APPlanning', value: 'Planning' },
    { key: 'APLocation', hash: '#APLocation', value: 'Location' },
    { key: 'APNationalPlan', hash: '#APNationalPlan', value: 'National Plan' },
    { key: 'APProgram', hash: '#APProgram', value: 'Program' },
    { key: 'APSector', hash: '#APSector', value: 'Sectors' },
    { key: 'APFunding', hash: '#APFunding', value: 'Funding' }];

/** Column counts for each section **/
export const ACTIVITY_INTERNAL_IDS_COLS = 3;
export const ACTIVITY_PLANNING_COLS = 3;
export const ACTIVITY_LOCATION_COLS = 3;
export const ACTIVITY_FUNDING_COLS = 2;

/** Validation status **/
export const STARTED_APPROVED_STATUS = 'startedapproved';
export const APPROVED_STATUS = 'approved';
export const STARTED_STATUS = 'started';
export const EDITED_STATUS = 'edited';
export const NOT_APPROVED = 'not_approved';
export const REJECTED_STATUS = 'rejected';

/** WS validation **/
export const WS_VALIDATION_OFF = 'validationOff';
export const WS_VALIDATION_ALL_EDIT = 'allEdits';
export const WS_VALIDATION_NEW_ONLY = 'newOnly';
export const WS_VALIDATION_FIELD = 'validation';

/** Roles **/
export const ROLE_TEAM_MEMBER_HEAD = 'team_head';
export const ROLE_TEAM_MEMBER_APPROVED = 'approver';

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
