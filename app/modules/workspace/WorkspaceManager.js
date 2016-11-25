import request from 'request';
import {BASE_URL} from '../../utils/Constants';

const GET_WORKSPACES_URL = "rest/security/workspaces";

const WorkspaceManager = {

  getWorkspacesFromRemote(token, callback) {
    console.log('getWorkspacesFromRemote');
    const self = this;
    const options = {
      url: BASE_URL + "/" + GET_WORKSPACES_URL,
      json: true,
      headers: {'content-type': 'application/json', 'Accept': 'application/json', 'X-Auth-Token': token},
      method: 'GET'
    };
    request(options, function (error, response, body) {
      console.log(body);
      if (response.statusCode === 500 || body.error) {
        callback(false, (error || JSON.stringify(body.error)));
      } else {
        console.log(body);
        callback(true, body);
      }
    });
  }
};

module.exports = WorkspaceManager;
