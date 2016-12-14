/* eslint-disable no-unused-expressions */
import {expect} from 'chai';
import {spy} from 'sinon';
import React from 'react';
import {shallow} from 'enzyme';
import Button from '../../../app/components/i18n/Button.jsx';
import translate from '../../../app/utils/translate';

function setup() {
  const props = {
    onClickHandler: spy(),
    text: 'test',
    className: 'test-class'
  };
  const component = shallow(<Button text={props.text} onClickHandler={props.onClickHandler}
                                    className={props.className}/>);
  return {
    component,
    props,
    buttons: component.find('button')
  };
}


describe('@@ Button @@', () => {
  it('Should translate correctly the text props.', () => {
    const {buttons, props} = setup();
    expect(buttons.at(0).text()).to.equal(translate(props.text));
  });

  it('Should use the text class from props.', () => {
    const {component, props} = setup();
    expect(component.find('.' + props.className)).to.have.length(1);
  });

  it('Should use the click handler from props.', () => {
    const {buttons, props} = setup();
    buttons.at(0).simulate('click');
    expect(props.onClickHandler.called).to.be.true;
  });
});
