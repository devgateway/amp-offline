import * as AC from './ActivityConstants';
import * as FM from './FeatureManagerConstants';
import { ORG_ROLE_NAMES } from './ValueConstants';

/**
 * This is a set of field paths that are used for frequent needs
 * @author Nadejda Mandrescu
 */

export const FUNDING_ACTIVE_LIST = 'fundings~active_list';
export const FUNDING_DETAILS_PATH = 'fundings~funding_details';
export const FUNDING_CURRENCY_PATH = 'fundings~funding_details~currency';
export const ADJUSTMENT_TYPE_PATH = 'fundings~funding_details~adjustment_type';
export const TRANSACTION_TYPE_PATH = 'fundings~funding_details~transaction_type';
export const ACTIVITY_INTERNAL_IDS_INTERNAL_ID_PATH = 'activity_internal_ids~internal_id';
export const ACTIVITY_INTERNAL_IDS_ORGANIZATION_PATH = 'activity_internal_ids~organization';
export const LOCATION_PATH = 'locations~location';
export const NATIONAL_PLAN_OBJECTIVE_PATH = 'national_plan_objective~program';
export const PRIMARY_PROGRAM_PATH = 'primary_programs~program';
export const SECONDARY_PROGRAM_PATH = 'secondary_programs~program';
export const PRIMARY_SECTOR_PATH = 'primary_sectors~sector';
export const SECONDARY_SECTOR_PATH = 'secondary_sectors~sector';
export const TERTIARY_SECTOR_PATH = 'tertiary_sectors~sector';
export const DONOR_ORGANIZATIONS_PATH = 'donor_organization~organization';

export const RELATED_ORGS_PATHS = ORG_ROLE_NAMES.map(orgRole => AC.toFieldName(orgRole));
export const RELATED_ORGS_ORGANIZATION_PATHS = ORG_ROLE_NAMES.map(
  orgRole => `${AC.toFieldName(orgRole)}~${AC.ORGANIZATION}`);

export const RICH_TEXT_FIELDS = new Set([AC.STATUS_REASON, AC.OBJECTIVE, AC.DESCRIPTION, AC.PROJECT_COMMENTS,
  AC.LESSONS_LEARNED, AC.PROJECT_IMPACT, AC.ACTIVITY_SUMMARY, AC.CONDITIONALITIES, AC.PROJECT_MANAGEMENT, AC.RESULTS,
]);

export const PATHS_WITH_TREE_STRUCTURE = new Set([NATIONAL_PLAN_OBJECTIVE_PATH, PRIMARY_PROGRAM_PATH,
  SECONDARY_PROGRAM_PATH, PRIMARY_SECTOR_PATH, SECONDARY_SECTOR_PATH, TERTIARY_SECTOR_PATH]);

export const PATHS_WITH_HIERARCHICAL_VALUES = new Set([NATIONAL_PLAN_OBJECTIVE_PATH, PRIMARY_PROGRAM_PATH,
  SECONDARY_PROGRAM_PATH, PRIMARY_SECTOR_PATH, SECONDARY_SECTOR_PATH, TERTIARY_SECTOR_PATH, LOCATION_PATH]);

export const ACTIVITY_CONTACT_PATHS = [AC.DONOR_CONTACT, AC.PROJECT_COORDINATOR_CONTACT,
  AC.SECTOR_MINISTRY_CONTACT, AC.MOFED_CONTACT, AC.IMPLEMENTING_EXECUTING_AGENCY_CONTACT];

export const DO_NOT_HYDRATE_FIELDS_LIST = [AC.APPROVAL_STATUS];

/* Fields paths alternative values location */
export const ALTERNATE_VALUE_PATH = {};
ALTERNATE_VALUE_PATH[AC.CREATED_ON] = AC.CLIENT_CREATED_ON;
ALTERNATE_VALUE_PATH[AC.MODIFIED_ON] = AC.CLIENT_UPDATED_ON;

/* FM paths for some activity fields that are always present in fields def, but may be hidden from display through FM */
export const ACTIVITY_FIELDS_FM_PATH = {};
ACTIVITY_FIELDS_FM_PATH[AC.MODIFIED_BY] = FM.ACTIVITY_LAST_UPDATED_BY;
ACTIVITY_FIELDS_FM_PATH[AC.MODIFIED_ON] = FM.ACTIVITY_LAST_UPDATED_ON;

/* Possible Options fields path prefixes */
export const PREFIX_ACTIVITY = null;
export const PREFIX_CONTACT = 'contact';

export const FIELD_PATH = 'field-path';
export const FIELD_OPTIONS = 'possible-options';
export const LIST_MAX_SIZE = 'size-limit';
