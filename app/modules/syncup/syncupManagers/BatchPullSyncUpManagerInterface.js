import SyncUpManagerInterface, { throwSyncUpError } from './SyncUpManagerInterface';
import { CONNECTION_FORCED_TIMEOUT } from '../../../utils/Constants';
import * as Utils from '../../../utils/Utils';
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import Logger from '../../util/LoggerManager';

const logger = new Logger('Batch pull syncup manager interface');

/* eslint-disable class-methods-use-this */

const PULL_END = 'PULL_END';
/*
 On my local, with the current solution, there was no significant difference if using 4 or 100 queue limit,
 or if using 10 or 100 check interval. I will stick to 4 queue limit (for pull requests mainly), to avoid AMP server
 overload in case multiple clients will run simultaneously.

 On remove there was no difference between check interval. While with a queue limit of 100, results processing was
 taking more than requests and sometime pull wait was aborted over the current 5sec timeout.
 */
const CHECK_INTERVAL = 100;
const QUEUE_LIMIT = 4;
const ABORT_INTERVAL = (CONNECTION_FORCED_TIMEOUT + CHECK_INTERVAL) * (QUEUE_LIMIT + 1); // milliseconds

/**
 * Abstract Pull Sync Up Manager that sends pull requests in batches
 *
 * @author Nadejda Mandrescu
 */
export default class BatchPullSyncUpManagerInterface extends SyncUpManagerInterface {
  constructor(syncUpType) {
    super(syncUpType);
    this._cancel = false;
    this.resultStack = [];
    this.requestsToProcess = 0;
    if (this.pullStart === undefined) {
      throwSyncUpError('BatchPullSyncUpManagerInterface.removeEntries not implemented');
    }
    if (this.processEntryPullResult === undefined) {
      throwSyncUpError('BatchPullSyncUpManagerInterface.processEntryPullResult not implemented');
    }
    if (this.onPullError === undefined) {
      throwSyncUpError('BatchPullSyncUpManagerInterface.onPullError not implemented');
    }
    this.onPullError = this.onPullError.bind(this);
    this._processResult = this._processResult.bind(this);
    this._waitWhile = this._waitWhile.bind(this);
  }

  /**
   * Initiates the pull workflow where child classes can prepare check/prepare data as needed and then pass request
   * configurations to pullNewEntriesInBatches when ready
   * @return {Promise}
   */
  pullInBatches() {
    return this.pullStart();
  }

  /**
   * Initiates the actual pull in batches for each request configuration
   * @param requestConfigurations stores a list of [
   *   { getConfig, onPullError: [param1, param2, ...] },
   *   { postConfig, onPullError: [param1, param2, ...] },
   * ...]
   */
  pullNewEntriesInBatches(requestConfigurations) {
    const pFactories = requestConfigurations.map(pullConfig => {
      const requestFunc = pullConfig.getConfig ? ConnectionHelper.doGet : ConnectionHelper.doPost;
      const config = pullConfig.getConfig || pullConfig.postConfig;
      return this._doRequest.bind(this, requestFunc, config, ...(pullConfig.onPullError || []));
    });
    // this is a sequential execution of promises through reduce (e.g. https://goo.gl/g44HvG)
    const pullPromise = pFactories.reduce((currentPromise, pFactory) => currentPromise
      .then(pFactory), Promise.resolve())
      .then((result) => this._waitWhile(this._hasPendingRequests).then(() => {
        this.resultStack.push(PULL_END);
        return result;
      }));
    return Promise.all([pullPromise, this._processResult()]);
  }

  _doRequest(requestFunc, config, ...onPullErrorData) {
    return this._waitWhile(this._isPullDenied).then(() => {
      requestFunc(config).then((data, error) => {
        this.resultStack.push([data, error]);
        return this._decRequestsToProcess();
      }).catch((error) => {
        this._decRequestsToProcess();
        this.onPullError(error, ...onPullErrorData);
      });
      // increase the count immediately it sent and decrease immediately the reply is received
      this._incRequestsToProcess();
      return Promise.resolve();
    });
  }

  _processResult() {
    return this._waitWhile(this._isNoResultToProcess).then(() => {
      const pFactories = [];
      let next = this._processResult;
      while (this.resultStack.length > 0) {
        const entry = this.resultStack.shift();
        if (entry === PULL_END) {
          logger.log(`${this.type} PULL_END flag reached on results stack.`);
          this.done = true;
          next = () => Promise.resolve();
        } else {
          const [data, error] = entry;
          pFactories.push(this.processEntryPullResult(data, error));
        }
      }
      return Promise.all(pFactories)
        .then(next)
        // TODO continue sync up of other activities if the error is not a connection issue
        .catch(error => Promise.reject(error));
    });
  }

  cancel() {
    this._cancel = true;
  }

  _hasPendingRequests() {
    return this.requestsToProcess > 0;
  }

  _isPullDenied() {
    return this.requestsToProcess > QUEUE_LIMIT;
  }

  _incRequestsToProcess() {
    this.requestsToProcess += 1;
  }

  _decRequestsToProcess() {
    this.requestsToProcess -= 1;
  }

  _isNoResultToProcess() {
    return this.resultStack.length === 0;
  }

  _waitWhile(conditionFunc) {
    return Utils.waitWhile(conditionFunc.bind(this), CHECK_INTERVAL, ABORT_INTERVAL);
  }

}
