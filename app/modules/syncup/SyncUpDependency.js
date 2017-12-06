import * as SS from './SyncUpUnitState';

/**
 * This class keeps track of the dependencies between sync up unit and their status based on SyncUpUnitState.js
 * @author Nadejda Mandrescu
 */
export default class SyncUpDependency {

  constructor() {
    this._rules = new Map();
    this._currentStates = {};
    this._pendingTypes = new Set();
    this.hasPendingOrDependencyPending = this.hasPendingOrDependencyPending.bind(this);
  }

  /**
   * Adds dependency rule for the specified sync up type and flags the state as DEPENDENCY_PENDING.
   * Sample: workspaces -> users -> [NO_CHANGES, COMPLETE]
   * @param type sync type for which the dependency _rules are configured
   * @param dependentType the type that needs to fullfil specified states to let 'type' unit to do the sync up
   * @param dependentTypeStates the list of acceptable states that for the dependent type to let the type sync up start
   */
  add(type, dependentType, dependentTypeStates) {
    const typeRules = this._rules.get(type) || new Map();
    typeRules.set(dependentType, dependentTypeStates);
    this._rules.set(type, typeRules);
    this.setState(type, SS.DEPENDENCY_PENDING);
  }

  /**
   * Sets to the sync up type a new state
   * @param type
   * @param state
   */
  setState(type, state) {
    this._currentStates[type] = state;
    if (state === SS.PENDING) {
      this._pendingTypes.add(type);
    } else {
      this._pendingTypes.delete(type);
    }
    this._updateUnitsState(type, state);
  }

  /**
   * Provides the next PENDING type, for which dependencies were successfully fulfilled
   */
  get nextPending() {
    return this._pendingTypes.values().next().value;
  }

  /**
   * If any types are still pending (with dependencies or not)
   * @return {boolean}
   */
  hasPendingOrDependencyPending() {
    return this._pendingTypes.size > 0 || this._rules.size > 0;
  }

  /**
   * Gets current state of the sync up 'type'
   * @param type
   * @return {*}
   */
  getState(type) {
    let state = this._currentStates[type];
    if (!state) {
      state = SS.PENDING;
      this.setState(type, SS.PENDING);
    }
    return state;
  }

  /**
   * Updates dependent units states and cleans up the _rules that are no longer relevant
   * @param type the type that gets a new state
   * @param state the new state
   * @private
   */
  _updateUnitsState(type, state) {
    // if the current unit is still pending, then other dependent units cannot be unblocked yet => skipping the update
    if (SS.STATES_PENDING.includes(state)) {
      return;
    }
    // if current 'type' is no longer pending, means we can exclude its dependency _rules from further checks & updates
    this._rules.delete(type);
    // if running -> no dependent units can be yet updated
    if (SS.IN_PROGRESS === state) {
      return;
    }

    // at this point only other "Pending" types remain to be checked
    this._rules.forEach((depRules: Map, otherType) => {
      const acceptableStates = depRules.get(type);
      if (acceptableStates) {
        // if dependency rule is satisfied, remove the dependency
        if (acceptableStates.includes(state)) {
          depRules.delete(type);
          // if this is the last rule that is satisfied, then transition the dependent unit as pending, no dependency
          if (depRules.size === 0) {
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
