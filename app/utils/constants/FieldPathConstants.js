/* eslint-disable max-len */
import { ActivityConstants, FeatureManagerConstants, ValueConstants } from 'amp-ui';

/**
 * This is a set of field paths that are used for frequent needs
 * @author Nadejda Mandrescu
 */

export const FUNDING_ACTIVE_LIST = 'fundings~active_list';
export const FUNDING_TYPE_OF_ASSISTANCE = `${ActivityConstants.FUNDINGS}~${ActivityConstants.TYPE_OF_ASSISTANCE}`;
export const FUNDING_DETAILS_PATH = `${ActivityConstants.FUNDINGS}~${ActivityConstants.FUNDING_DETAILS}`;
/**
 * Legacy funding currency path used for data migration
 * @deprecated since 1.4
 */
export const FUNDING_CURRENCY_PATH = `${FUNDING_DETAILS_PATH}~${ActivityConstants.CURRENCY}`;
export const MTEF_CURRENCY_PATH = `${ActivityConstants.FUNDINGS}~${ActivityConstants.MTEF_PROJECTIONS}~${ActivityConstants.CURRENCY}`;
export const PPC_CURRENCY_PATH = `${ActivityConstants.PPC_AMOUNT}~${ActivityConstants.CURRENCY}`;
export const RPC_CURRENCY_PATH = `${ActivityConstants.RPC_AMOUNT}~${ActivityConstants.CURRENCY}`;
export const COMPONENT_CURRENCY_PATH = `${ActivityConstants.COMPONENTS}~${ActivityConstants.COMPONENT_FUNDING}~${ActivityConstants.CURRENCY}`;
export const DISBURSEMENTS_PATH = `${ActivityConstants.FUNDINGS}~${ActivityConstants.DISBURSEMENTS}`;
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
export const RESPONSIBLE_ORGANIZATION_BUDGETS_PATH = `${ActivityConstants.RESPONSIBLE_ORGANIZATION}~${ActivityConstants.BUDGETS}`;

export const RELATED_ORGS_PATHS = ValueConstants.ORG_ROLE_NAMES.map(orgRole => ActivityConstants.toFieldName(orgRole));
export const RELATED_ORGS_ORGANIZATION_PATHS = ValueConstants.ORG_ROLE_NAMES.map(
  orgRole => `${ActivityConstants.toFieldName(orgRole)}~${ActivityConstants.ORGANIZATION}`);

export const RICH_TEXT_FIELDS = new Set([ActivityConstants.STATUS_REASON, ActivityConstants.OBJECTIVE, ActivityConstants.DESCRIPTION, ActivityConstants.PROJECT_COMMENTS,
  ActivityConstants.LESSONS_LEARNED, ActivityConstants.PROJECT_IMPACT, ActivityConstants.ACTIVITY_SUMMARY, ActivityConstants.CONDITIONALITIES, ActivityConstants.PROJECT_MANAGEMENT, ActivityConstants.RESULTS,
]);

export const PATHS_WITH_TREE_STRUCTURE = new Set([NATIONAL_PLAN_OBJECTIVE_PATH, PRIMARY_PROGRAM_PATH,
  SECONDARY_PROGRAM_PATH, PRIMARY_SECTOR_PATH, SECONDARY_SECTOR_PATH, TERTIARY_SECTOR_PATH]);

export const PATHS_WITH_HIERARCHICAL_VALUES = new Set([NATIONAL_PLAN_OBJECTIVE_PATH, PRIMARY_PROGRAM_PATH,
  SECONDARY_PROGRAM_PATH, PRIMARY_SECTOR_PATH, SECONDARY_SECTOR_PATH, TERTIARY_SECTOR_PATH, LOCATION_PATH]);

export const ACTIVITY_CONTACT_PATHS = [ActivityConstants.DONOR_CONTACT, ActivityConstants.PROJECT_COORDINATOR_CONTACT,
  ActivityConstants.SECTOR_MINISTRY_CONTACT, ActivityConstants.MOFED_CONTACT, ActivityConstants.IMPLEMENTING_EXECUTING_AGENCY_CONTACT];

export const TRANSACTION_TYPES = [ActivityConstants.COMMITMENTS, ActivityConstants.DISBURSEMENTS, ActivityConstants.EXPENDITURES];
export const TRANSACTION_TYPES_ORDERED = TRANSACTION_TYPES;
export const FUNDING_TRANSACTION_TYPES = [...TRANSACTION_TYPES, ActivityConstants.ESTIMATED_DISBURSEMENTS];
export const ADJUSTMENT_TYPE_PATHS = FUNDING_TRANSACTION_TYPES.map(tt => `${ActivityConstants.FUNDINGS}~${tt}~${ActivityConstants.ADJUSTMENT_TYPE}`);
export const FUNDING_CURRENCY_PATHS = TRANSACTION_TYPES.map(tt => `${ActivityConstants.FUNDINGS}~${tt}~${ActivityConstants.CURRENCY}`);

export const PATHS_FOR_ACTIVITY_CURRENCY = [FUNDING_CURRENCY_PATH, MTEF_CURRENCY_PATH, COMPONENT_CURRENCY_PATH,
  PPC_CURRENCY_PATH, RPC_CURRENCY_PATH, ...FUNDING_CURRENCY_PATHS];

export const PATHS_FOR_CURRENCY = new Set([ActivityConstants.CURRENCY, ...PATHS_FOR_ACTIVITY_CURRENCY]);

export const DO_NOT_HYDRATE_FIELDS_LIST = [ActivityConstants.APPROVAL_STATUS];

/* Fields paths alternative values location */
export const ALTERNATE_VALUE_PATH = {};
ALTERNATE_VALUE_PATH[ActivityConstants.CREATED_ON] = ActivityConstants.CLIENT_CREATED_ON;
ALTERNATE_VALUE_PATH[ActivityConstants.MODIFIED_ON] = ActivityConstants.CLIENT_UPDATED_ON;

/* FM paths for some activity fields that are always present in fields def, but may be hidden from display through FM */
export const ACTIVITY_FIELDS_FM_PATH = {};
ACTIVITY_FIELDS_FM_PATH[ActivityConstants.MODIFIED_BY] = FeatureManagerConstants.ACTIVITY_LAST_UPDATED_BY;
ACTIVITY_FIELDS_FM_PATH[ActivityConstants.MODIFIED_ON] = FeatureManagerConstants.ACTIVITY_LAST_UPDATED_ON;

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
export const FIELD_TYPE_STRING = 'string';
export const FIELD_TYPE_LONG = 'long';
export const FIELD_TYPE_FLOAT = 'float';
export const FIELD_TYPE_BOOLEAN = 'boolean';
export const FIELD_TYPE_DATE = 'date';
export const FIELD_TYPE_TIMESTAMP = 'timestamp';
