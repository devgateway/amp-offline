// @flow
export const STATE_SELECT_WORKSPACE = 'STATE_SELECT_WORKSPACE';

export function selectWorkspace(data) {
  return {
    type: STATE_SELECT_WORKSPACE,
    actionData: data
  };
}
