import ChangelogLogger from '../ChangelogLogger';
import * as LanguageHelper from '../../../modules/helpers/LanguageHelper';

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
        changeid: 'AMPOFFLINE-1306',
        author: 'nmandrescu',
        comment: 'Test "update" functionality',
        context: ['startup', 'init'],
        preConditions: [{
          func: () => LanguageHelper.findById('en').then(r => !!r)
        }],
        changes: {
          update: {
            table: 'languages',
            field: 'name',
            value: 'English2 ',
            filter: { id: 'en' }
          }
        },
        rollback: {
          update: {
            table: 'languages',
            field: 'name',
            value: 'English ',
            filter: { id: 'en' }
          }
        }
      },
    ]
  },
});
