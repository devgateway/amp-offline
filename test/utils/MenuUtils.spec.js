import {expect} from 'chai';
import * as MenuUtils from '../../app/utils/MenuUtils';

describe('@@ MenuUtils @@', () => {
  it('func toShow - Should allow when logged in', () => {
    expect(MenuUtils.toShow(true, true)).to.equal(true);
  });

  it('func toShow - Should allow when is public (2)', () => {
    expect(MenuUtils.toShow(true, false)).to.equal(true);
  });

  it('func toShow - Should block when is not public and not logged in', () => {
    expect(MenuUtils.toShow(false, false)).to.equal(false);
  });

  it('func toShow - Should allow when is not public and is logged in', () => {
    expect(MenuUtils.toShow(false, true)).to.equal(true);
  });
});
