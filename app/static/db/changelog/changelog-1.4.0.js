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
        },
        getMd5: () => 'f8deb88414c704749f17d188639e6f75'
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
        },
        getMd5: () => '303e5724f56dd92f6ea85232bdc4bbf0'
      }
    ]
  },
});
