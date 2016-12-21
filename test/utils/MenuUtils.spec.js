import {expect} from 'chai';
import MenuUtils from '../../app/utils/MenuUtils';

describe('@@ MenuUtils @@', () => {
  it('func checkIfPublic - Should allow when logged in', () => {
    expect(MenuUtils.checkIfPublic(true, true)).to.equal(true);
  });

  it('func checkIfPublic - Should allow when is public (2)', () => {
    expect(MenuUtils.checkIfPublic(true, false)).to.equal(true);
  });

  it('func checkIfPublic - Should block when is not public and not logged in', () => {
    expect(MenuUtils.checkIfPublic(false, false)).to.equal(false);
  });

  it('func checkIfPublic - Should allow when is not public and is logged in', () => {
    expect(MenuUtils.checkIfPublic(false, true)).to.equal(true);
  });
});
