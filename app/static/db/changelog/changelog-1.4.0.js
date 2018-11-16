import ChangelogLogger from '../ChangelogLogger';

export default({
  changelog: {
    preConditions: [
      {
        func: () => {
          ChangelogLogger.log('This is a valid precondition');
          return true;
        },
        onError: 'HALT'
      },
    ],
    changesets: [
      {
        changeid: 'AMPOFFLINE-1301 successful',
        author: 'nmandrescu',
        comment: 'POC test 1',
        preConditions: [
          {
            func: () => {
              ChangelogLogger.log('This is a valid precondition');
              return true;
            },
            onError: 'HALT'
          },
          {
            changeid: 'a valid changeset reference',
            author: 'anyone',
            file: 'some file',
            onError: 'HALT',
            onFail: 'CONTINUE'
          },
          {
            changeid: 'a valid changeset reference',
            author: 'anyone',
            file: 'some file',
            onFail: 'CONTINUE'
          }
        ],
        changes: {
          func: () => { ChangelogLogger.log('This changeset must succeed'); },
        },
        rollback: {
          func: () => {
            ChangelogLogger.error('This rollback must NOT be called');
          },
        }
      },
      {
        changeid: 'AMPOFFLINE-1301 unsuccessful',
        author: 'nmandrescu',
        comment: 'POC test 2',
        changes: {
          func: () => { ChangelogLogger.log('This changeset must fail'); return Promise.reject(); }
        },
        rollback: {
          func: () => { ChangelogLogger.log('This rollback must be called'); }
        }
      }
    ]
  },
});
