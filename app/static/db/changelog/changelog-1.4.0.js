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
        getMd5: () => 'e6c7af4edcef0f0b10d1a112b6a4c2ec'
      },
      {
        changeid: 'AMPOFFLINE-1301 unsuccessful',
        author: 'nmandrescu',
        comment: 'POC test 2',
        changes: {
          func: () => { ChangelogLogger.log('This changeset must fail'); return Promise.reject(); }
        },
        rollback: () => { ChangelogLogger.log('This rollback must be called'); },
        getMd5: () => '5bf5cad2419523f2788f9c1bc73e5a52'
      }
    ]
  },
});
