import ChangelogLogger from '../ChangelogLogger';

export default({
  changelog: {
    preConditions: [
      {
        func: () => { ChangelogLogger.log('This is a valid precondition'); },
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
            func: () => { ChangelogLogger.log('This is a valid precondition'); },
            onError: 'HALT'
          },
          {
            changeid: 'a valid changeset reference',
            author: 'anyone',
            file: 'some file',
            onError: 'CONTINUE',
            onFail: 'HALT'
          },
          {
            changeid: 'a valid changeset reference',
            author: 'anyone',
            file: 'some file',
            onFail: 'HALT'
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
        getMd5: () => 'aab3998f6ae5f41a43992f98197a5e6c'
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
