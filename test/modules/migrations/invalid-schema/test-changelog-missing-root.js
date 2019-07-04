
export default({
  preConditions: [
    {
      func: () => true
    },
  ],
  changesets: [
    {
      changeid: 'AMPOFFLINE-1307',
      author: 'nmandrescu',
      comment: 'Test missing root',
      context: 'startup',
      changes: {
        func: () => {}
      }
    },
  ]
});
