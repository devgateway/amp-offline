/**
 * AMP Server configuration definition class
 *
 * @author Nadejda Mandrescu
 */
import { AMP_SERVER_ID } from '../connectivity/AmpApiConstants';

export default class AmpServer {
  id: number;
  name: Object;
  urls: Array<string>;
  iso2: string;
  [AMP_SERVER_ID]: string;

  static deserialize(json) {
    return new AmpServer(json);
  }

  constructor({ id, name, urls, ...otherProps }) {
    this.id = id;
    this.name = name;
    this.urls = urls || [];
    Object.assign(this, otherProps);
  }

  get serverId() {
    return this[AMP_SERVER_ID];
  }

  set serverId(serverId) {
    this[AMP_SERVER_ID] = serverId;
  }
}
