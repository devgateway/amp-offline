import { describe, it, before } from 'mocha';
import * as ActivityHelper from '../../../app/modules/helpers/ActivityHelper';
import * as WorkspaceHelper from '../../../app/modules/helpers/WorkspaceHelper';
import * as GlobalSettingsHelper from '../../../app/modules/helpers/GlobalSettingsHelper';
import * as WorkspaceManager from '../../../app/modules/workspace/WorkspaceManager';
import * as GSC from '../../../app/utils/constants/GlobalSettingsConstants';
import * as Utils from '../../../app/utils/Utils';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);


const activities = require('./activities.json');
const workspaces = require('./workspaces.json');

const gs1 = {};
gs1[GSC.SHOW_WORKSPACE_FILTER_KEY] = true;
gs1[GSC.FILTER_BY_DATE_HIDE_PROJECTS] = false;

const NO_WORKSPACE_FILTERS_WS_ID = 1;
const WORKSPACE_FILTERS_AS_FILTERS_WS_ID = 16;
const WORKSPACE_FILTERS_AS_CHILD_ORGS_WS_ID = 20;
const WORKSPACE_FILTERS_BY_STATUS_WS_ID = 21;
const WORKSPACE_FILTERS_BY_DONOR_ORG_WS_ID = 22;
const WORKSPACE_FILTERS_BY_LOCATION_WS_ID = 23;
const WORKSPACE_FILTERS_BY_PROGRAM_WS_ID = 24;
const WORKSPACE_FILTERS_BY_START_DATE_WS_ID = 25;
const PRIVATE_WORKSPACE_ID = 33;
const WORKSPACES_SHOWS_ALL_ACTIVITIES = 4;

describe('@@ WorkspaceFilter @@', () => {
  before(() =>
    Promise.all([
      ActivityHelper.replaceAll(activities),
      WorkspaceHelper.replaceWorkspaces(workspaces),
      GlobalSettingsHelper.saveGlobalSettings(gs1)
    ])
  );

  /* General workspace filter tests 8 */
  describe('getWorkspaceFilter', () =>
    it('should match simple team filter', () =>
      expect(WorkspaceHelper.findById(NO_WORKSPACE_FILTERS_WS_ID).then(workspace =>
        WorkspaceManager.getWorkspaceFilter(workspace).then(dbFilter => ActivityHelper.findAll(dbFilter, { id: 1 }))))
        .to.eventually.deep.equal([{ id: 1170 }])
    )
  );

  describe('getWorkspaceFilter', () =>
    it('should activities from the private workspace only', () =>
      expect(WorkspaceHelper.findById(PRIVATE_WORKSPACE_ID).then(workspace =>
        WorkspaceManager.getWorkspaceFilter(workspace).then(dbFilter => ActivityHelper.findAll(dbFilter, { id: 1 }))))
        .to.eventually.deep.equal([{ id: 1187 }])
    )
  );

  describe('getWorkspaceFilter', () =>
    it('should provide all activities excluding those from private workspaces', () =>
      expect(WorkspaceHelper.findById(WORKSPACES_SHOWS_ALL_ACTIVITIES).then(workspace =>
        WorkspaceManager.getWorkspaceFilter(workspace).then(dbFilter => ActivityHelper.findAll(dbFilter, { id: 1 }))
          .then(acts => Utils.flattenToListByKey(acts, 'id').sort((a, b) => a - b))))
        .to.eventually.deep.equal([912, 1170])
    )
  );

  describe('getWorkspaceFilter', () =>
    it('should match activities by computed workspace that uses filters', () =>
      expect(WorkspaceHelper.findById(WORKSPACE_FILTERS_AS_FILTERS_WS_ID).then(workspace =>
        WorkspaceManager.getWorkspaceFilter(workspace).then(dbFilter => ActivityHelper.findAll(dbFilter, { id: 1 }))))
        .to.eventually.deep.have.same.members([{ id: 1170 }, { id: 912 }])
    )
  );

  describe('getWorkspaceFilter', () =>
    it('should match activities by computed workspace that uses child orgs', () =>
      expect(WorkspaceHelper.findById(WORKSPACE_FILTERS_AS_CHILD_ORGS_WS_ID).then(workspace =>
        WorkspaceManager.getWorkspaceFilter(workspace).then(dbFilter => ActivityHelper.findAll(dbFilter, { id: 1 }))))
        .to.eventually.deep.have.same.members([{ id: 1170 }, { id: 912 }])
    )
  );

  /* Tests for specific filters from a computed workspace */
  describe('getWorkspaceFilter', () =>
    it('should match activities by computed workspace status filter', () =>
      expect(WorkspaceHelper.findById(WORKSPACE_FILTERS_BY_STATUS_WS_ID).then(workspace =>
        WorkspaceManager.getWorkspaceFilter(workspace).then(dbFilter => ActivityHelper.findAll(dbFilter, { id: 1 }))))
        .to.eventually.deep.have.same.members([{ id: 1170 }, { id: 912 }])
    )
  );

  describe('getWorkspaceFilter', () =>
    it('should match activities by computed workspace donor org filter', () =>
      expect(WorkspaceHelper.findById(WORKSPACE_FILTERS_BY_DONOR_ORG_WS_ID).then(workspace =>
        WorkspaceManager.getWorkspaceFilter(workspace).then(dbFilter => ActivityHelper.findAll(dbFilter, { id: 1 }))))
        .to.eventually.deep.have.same.members([{ id: 1170 }, { id: 912 }])
    )
  );

  describe('getWorkspaceFilter', () =>
    it('should match activities by computed workspace location filter', () =>
      expect(WorkspaceHelper.findById(WORKSPACE_FILTERS_BY_LOCATION_WS_ID).then(workspace =>
        WorkspaceManager.getWorkspaceFilter(workspace).then(dbFilter => ActivityHelper.findAll(dbFilter, { id: 1 }))))
        .to.eventually.deep.have.same.members([{ id: 1170 }])
    )
  );

  describe('getWorkspaceFilter', () =>
    it('should match activities by computed workspace program filter', () =>
      expect(WorkspaceHelper.findById(WORKSPACE_FILTERS_BY_PROGRAM_WS_ID).then(workspace =>
        WorkspaceManager.getWorkspaceFilter(workspace).then(dbFilter => ActivityHelper.findAll(dbFilter, { id: 1 }))))
        .to.eventually.deep.have.same.members([{ id: 1170 }])
    )
  );

  describe('getWorkspaceFilter', () =>
    it('should match activities by computed workspace actual start date filter', () =>
      expect(WorkspaceHelper.findById(WORKSPACE_FILTERS_BY_START_DATE_WS_ID).then(workspace =>
        WorkspaceManager.getWorkspaceFilter(workspace).then(dbFilter => ActivityHelper.findAll(dbFilter, { id: 1 }))))
        .to.eventually.deep.have.same.members([{ id: 912 }])
    )
  );

  // TODO once donor groups and types are synced, add test by their filters
});
