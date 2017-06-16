import * as SS from './SyncUpUnitState';

/**
 * This class keeps track of the dependencies between sync up unit and their status based on SyncUpUnitState.js
 * @author Nadejda Mandrescu
 */
export default class SyncUpDependency {

  constructor() {
    this.rules = {};
    this.currentStates = {};
  }

  /**
   * Adds dependency rule for the specified sync up type.
   * Sample: workspaces -> users -> [NO_CHANGES, COMPLETE]
   * @param type sync type for which the dependency rules are configured
   * @param dependentType the type that needs to fullfil specified states to let 'type' unit to do the sync up
   * @param dependentTypeStates the list of acceptable states that for the dependent type to let the type sync up start
   */
  add(type, dependentType, dependentTypeStates) {
    const typeRules = this.rules[type] || {};
    typeRules[dependentType] = dependentTypeStates;
    this.rules[type] = typeRules;
    this.currentStates[type] = SS.DEPENDENCY_PENDING;
  }

  /**
   * Sets to the sync up type a new state
   * @param type
   * @param state
   */
  setState(type, state) {
    this.currentStates[type] = state;
    this._updateUnitsState(type, state);
  }

  // TODO do we need it?
  resetCurrentStates() {
    this.currentStates = {};
  }

  /**
   * Gets current state of the sync up 'type'
   * @param type
   * @return {*}
   */
  getState(type) {
    let state = this.currentStates[type];
    if (!state) {
      state = SS.PENDING;
      this.currentStates[type] = state;
    }
    return state;
  }

  /**
   * Updates dependent units states and cleans up the rules that are no longer relevant
   * @param type the type that gets a new state
   * @param state the new state
   * @private
   */
  _updateUnitsState(type, state) {
    // if the current unit is still pending, then other dependent units cannot be unblocked yet => skipping the update
    if (SS.STATES_PENDING.has(state)) {
      return;
    }
    // if current 'type' is no longer pending, means we can exclude its dependency rules from further checks & updates
    delete this.rules[type];

    // at this point only other "Pending" types remain to be checked
    Object.entries(this.rules).forEach(([otherType, depRules]) => {
      if (depRules[type]) {
        // if dependency rule is satisfied, remove the dependency
        if (depRules[type].includes(state)) {
          delete depRules[type];
          // if this is the last rule that is satisfied, then transition the dependent unit as pending, no dependency
          if (Object.keys(depRules).length === 0) {
            this.setState(otherType, SS.PENDING);
          }
        } else {
          // otherwise mark as dependency failed
          this.setState(otherType, SS.DEPENDENCY_FAIL);
        }
      }
    });
  }
}
