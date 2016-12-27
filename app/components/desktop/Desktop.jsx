// @flow
import React, {Component, PropTypes} from 'react';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import UrlUtils from '../../utils/URLUtils'
import Button from '../i18n/Button'

export default class Desktop extends Component {

  constructor() {
    super();
    console.log('constructor');

    this.state = {
      errorMessage: '',
      isLoadingDesktop: false
    };
  }
  static propTypes = {
    loadDesktop: PropTypes.func.isRequired
  };
  componentDidMount() {
    console.log('componentDidMount');
    this.props.loadDesktop('teamId');
  }

  render() {
    const {teamId} = this.props.params.teamId;
    const {WorkspaceName}=this.props.location.query;
    this.state.errorMessage = this.props.desktop.errorMessage || '';
    this.state.isLoadingDesktop = this.props.desktop.isLoadingDesktop;
    return (
      <div>We are going to load desktop for teamId :{teamId} name :{WorkspaceName}
        <Button type="button" className={'btn btn-success ' } onClick={() => {
            UrlUtils.goBack()
          }} text="desktop.goback">
        </Button>
      </div>
    );

  }
}
