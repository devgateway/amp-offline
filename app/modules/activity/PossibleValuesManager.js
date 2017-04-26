import LoggerManager from '../../modules/util/LoggerManager';

const PossibleValuesManager = {
  /**
   * Builds tree set of ids from the parentId
   * This implementation is based on the current locations extra info approach and can change.
   * // TODO update if needed based on latest approach from AMP-25619
   */
  expandParentWithChildren(options, parentId) {
    LoggerManager.log('expandParentWithChildren');
    if (parentId === undefined || parentId === null) {
      return null;
    }
    const ids = new Set();
    let idsToExpand = [parentId];
    while (idsToExpand.length > 0) {
      const nextId = idsToExpand.pop();
      if (!ids.has(nextId)) {
        ids.add(nextId);
        const newIds = options
          .filter(o => o.extra_info && o.extra_info.parent_location_id && o.extra_info.parent_location_id === nextId)
          .map(o => o.id);
        idsToExpand = idsToExpand.concat(newIds);
      }
    }
    return ids;
  }
};

export default PossibleValuesManager;
