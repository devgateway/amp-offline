import * as OrgConstants from './OrgConstants';

/**
 * @author Nadejda Mandrescu
 */

export const ORG_ROLE_FIELDS = toFieldNames(OrgConstants.ORG_ROLE_NAMES);

// Activity fields
export const ACTIVITY_BUDGET = 'activity_budget';
export const ACTIVITY_STATUS = 'activity_status';
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
export const FINANCING_INSTRUMENT = 'financing_instrument';
export const MODALITIES = 'modalities';
export const LINE_MINISTRY_RANK = 'line_ministry_rank';
export const FUNDING_STATUS = 'funding_status';
export const LOCATIONS = 'locations';
export const LOCATION = 'location';
export const APPROVAL_STATUS = 'approval_status';
export const TYPE_OF_ASSISTANCE = 'type_of_assistance';
export const EXPENDITURE_CLASS = 'expenditure_class';
export const FUNDING_DETAILS = 'funding_details';
export const MODE_OF_PAYMENT = 'mode_of_payment';
export const PROJECT_CATEGORY = 'project_category';
export const PROJECT_IMPLEMENTING_UNIT = 'project_implementing_unit';
export const ORGANIZATION = 'organization';
export const EXECUTING_AGENCY = 'executing_agency';
export const CONTRACTING_AGENCY = 'contracting_agency';
export const BENEFICIARY_AGENCY = 'beneficiary_agency';
export const IMPLEMENTING_AGENCY = 'implementing_agency';
export const RESPONSIBLE_ORGANIZATION = 'responsible_organization';
export const DONOR_ORGANIZATION = 'donor_organization';
export const ARCHIVED = 'archived';
export const TRANSACTION_DATE = 'transaction_date';
export const ACTUAL_START_DATE = 'actual_start_date';
export const ACTUAL_COMPLETION_DATE = 'actual_completion_date';
export const CONTRACTING_DATE = 'contracting_date';
export const PROPOSED_APPROVAL_DATE = 'proposed_approval_date';
export const EFFECTIVE_FUNDING_DATE = 'effective_funding_date';
export const FUNDING_CLOSING_DATE = 'funding_closing_date';
export const HUMANITARIAN_AID = 'humanitarian_aid';
export const DISASTER_RESPONSE = 'disaster_response';
export const PROGRAM = 'program';
export const NATIONAL_PLAN_OBJECTIVE = 'national_plan_objective';
export const PRIMARY_PROGRAMS = 'primary_programs';
export const SECONDARY_PROGRAMS = 'secondary_programs';
export const GOVERNMENT_APPROVAL_PROCEDURES = 'government_approval_procedures';
export const JOINT_CRITERIA = 'joint_criteria';

// TODO: once activities are imported and team is exported, please update to the correct field name
export const TEAM = 'team';

export function toFieldNames(listOfNames) {
  return listOfNames.map(name => toFieldName(name));
}

export function toFieldName(name) {
  return name.toLowerCase().replace(' ', '_');
}

