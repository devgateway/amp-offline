import ChangelogLogger from '../ChangelogLogger';

export default({
  changelog: {
    preConditions: [{}],
    changesets: [
      {
        changeid: 'AMPOFFLINE-1301 successful',
        author: 'nmandrescu',
        comment: 'POC test 1',
        changes: {
          func: () => { ChangelogLogger.log('This changeset must succeed'); },
        },
        rollback: () => { ChangelogLogger.error('This rollback must NOT be called'); },
        getMd5: () => 'da1e84f0641988dfd686e23aeb54e4a9'
      },
      {
        changeid: 'AMPOFFLINE-1301 unsuccessful',
        author: 'nmandrescu',
        comment: 'POC test 2',
        changes: {
          func: () => { ChangelogLogger.log('This changeset must fail'); return Promise.reject(); }
        },
        rollback: () => { ChangelogLogger.log('This rollback must be called'); },
        getMd5: () => '44ccbd72bcfc483ab2df4060140a2c28'
      }
    ]
  },
});
