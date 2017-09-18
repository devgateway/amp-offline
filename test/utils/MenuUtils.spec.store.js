import { expect } from 'chai';
import * as MenuUtils from '../../app/utils/MenuUtils';

describe('@@ MenuUtils @@', () => {
  it('should allow when logged in -> func toShow ', () => {
    expect(MenuUtils.toShow(true, true)).to.equal(true);
  });

  it('should allow when is public (2) -> func toShow', () => {
    expect(MenuUtils.toShow(true, false)).to.equal(true);
  });

  it('should block when is not public and not logged in -> func toShow', () => {
    expect(MenuUtils.toShow(false, false)).to.equal(false);
  });

  it('should allow when is not public and is logged in -> func toShow', () => {
    expect(MenuUtils.toShow(false, true)).to.equal(true);
  });
});
