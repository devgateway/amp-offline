import * as AC from './ActivityConstants';
import * as FM from './FeatureManagerConstants';
import { ORG_ROLE_NAMES } from './ValueConstants';

/**
 * This is a set of field paths that are used for frequent needs
 * @author Nadejda Mandrescu
 */

export const FUNDING_ACTIVE_LIST = 'fundings~active_list';
export const FUNDING_TYPE_OF_ASSISTANCE = `${AC.FUNDINGS}~${AC.TYPE_OF_ASSISTANCE}`;
export const FUNDING_DETAILS_PATH = `${AC.FUNDINGS}~${AC.FUNDING_DETAILS}`;
/**
 * Legacy funding currency path used for data migration
 * @deprecated since 1.4
 */
export const FUNDING_CURRENCY_PATH = `${FUNDING_DETAILS_PATH}~${AC.CURRENCY}`;
export const MTEF_CURRENCY_PATH = `${AC.FUNDINGS}~${AC.MTEF_PROJECTIONS}~${AC.CURRENCY}`;
export const PPC_CURRENCY_PATH = `${AC.PPC_AMOUNT}~${AC.CURRENCY}`;
export const RPC_CURRENCY_PATH = `${AC.RPC_AMOUNT}~${AC.CURRENCY}`;
export const COMPONENT_CURRENCY_PATH = `${AC.COMPONENTS}~${AC.COMPONENT_FUNDING}~${AC.CURRENCY}`;
export const DISBURSEMENTS_PATH = `${AC.FUNDINGS}~${AC.DISBURSEMENTS}`;
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
export const RESPONSIBLE_ORGANIZATION_BUDGETS_PATH = `${AC.RESPONSIBLE_ORGANIZATION}~${AC.BUDGETS}`;

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

export const TRANSACTION_TYPES = [AC.COMMITMENTS, AC.DISBURSEMENTS, AC.EXPENDITURES];
export const TRANSACTION_TYPES_ORDERED = TRANSACTION_TYPES;
export const ADJUSTMENT_TYPE_PATHS = TRANSACTION_TYPES.map(tt => `${AC.FUNDINGS}~${tt}~${AC.ADJUSTMENT_TYPE}`);
export const FUNDING_CURRENCY_PATHS = TRANSACTION_TYPES.map(tt => `${AC.FUNDINGS}~${tt}~${AC.CURRENCY}`);

export const PATHS_FOR_ACTIVITY_CURRENCY = [FUNDING_CURRENCY_PATH, MTEF_CURRENCY_PATH, COMPONENT_CURRENCY_PATH,
  PPC_CURRENCY_PATH, RPC_CURRENCY_PATH, ...FUNDING_CURRENCY_PATHS];

export const PATHS_FOR_CURRENCY = new Set([AC.CURRENCY, ...PATHS_FOR_ACTIVITY_CURRENCY]);

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
export const PREFIX_RESOURCE = 'resource';
export const PREFIX_COMMON = 'common';
export const PREFIX_LIST = [PREFIX_ACTIVITY, PREFIX_CONTACT, PREFIX_RESOURCE, PREFIX_COMMON];

export const FIELD_PATH = 'field-path';
export const FIELD_OPTIONS = 'possible-options';
export const FIELD_OPTION_USABLE = 'option-usable';
export const LIST_MAX_SIZE = 'size-limit';
export const REGEX_PATTERN = 'regex-pattern';
export const FIELD_NAME = 'field_name';
export const FIELD_LABEL = 'field_label';
export const FIELD_REQUIRED = 'required';
export const FIELD_UNIQUE_CONSTRAINT = 'unique_constraint';
export const FIELD_TYPE = 'field_type';
export const FIELD_LENGTH = 'field_length';
export const FIELD_PERCENTAGE = 'percentage';
export const FIELD_PERCENTAGE_CONSTRAINT = 'percentage_constraint';
export const FIELD_ITEM_TYPE = 'item-type';
export const FIELD_IMPORTABLE = 'importable';
export const FIELD_ID_ONLY = 'id_only';
export const FIELD_MULTIPLE_VALUES_ALLOWED = 'multiple_values';
export const FIELD_TREE_COLLECTION = 'tree_collection';
export const FIELD_CHILDREN = 'children';
export const FIELD_DEPENDENCIES = 'dependencies';

export const FIELD_TYPE_LIST = 'list';
export const FIELD_TYPE_OBJECT = 'object';
