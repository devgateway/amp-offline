import { describe, it } from 'mocha';
import * as actions from '../../app/modules/helpers/WSSettingsHelper';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const init = {
  id: 149,
  'workspace-id': 12,
  'default-records-per-page': 10,
  'report-start-year': null,
  'report-end-year': null,
  currency: 'USD',
  'fiscal-calendar': 1,
  language: 'fr',
  validation: 'validationOff',
  'show-all-countries': false,
  'default-team-report': null,
  'default-reports-per-page': null,
  'allow-add-team-res': null,
  'allow-share-team-res': null,
  'allow-publishing-resources': null,
  'number-of-pages-to-display': null
};
const wsSettingsCollection = [init, { id: 1 }, { id: 2 }];

describe('@@ WSSettingsHelper @@', () => {
  describe('replaceAllWSSettings', () =>
    it('should clear data', () =>
      expect(actions.replaceAllWSSettings([])).to.eventually.have.lengthOf(0)
    )
  );
  describe('saveOrUpdateWSSettings', () =>
    it('should save initial data', () =>
      expect(actions.saveOrUpdateWSSettings(init)).to.eventually.deep.equal(init)
    )
  );

  describe('findById', () =>
    it('should find by id', () =>
      expect(actions.findById(init.id)).to.eventually.deep.equal(init)
    )
  );

  describe('saveOrUpdateWSSettingsCollection', () =>
    it('should save entire collection', () =>
      expect(actions.saveOrUpdateWSSettingsCollection(wsSettingsCollection))
        .to.eventually.have.lengthOf(wsSettingsCollection.length)
    )
  );

  describe('findByWorkspaceId', () =>
    it('should find by workspace id', () =>
      expect(actions.findByWorkspaceId(init['workspace-id'])).to.eventually.deep.equal(init)
    )
  );

  describe('deleteById', () =>
    it('should delete by id', () =>
      expect(actions.deleteById(init.id)).to.eventually.equal(1)
    )
  );
});
