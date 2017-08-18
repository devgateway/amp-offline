import * as child from 'child_process';
import * as path from 'path';
import * as app from 'electron';

export default class versionUpdateManager {

  static install() {
    alert('install');
    const isSilent = false;
    if (this.quitAndInstallCalled) {
      return false;
    }
    const setupPath = path.join('C:\\amp\\AMPOffline\\dist', 'amp-offline-1.0.0.exe');
    // prevent calling several times
    this.quitAndInstallCalled = true;
    const args = ['--updated'];
    if (isSilent) {
      args.push('/S');
    }
    const spawnOptions = {
      detached: true,
      stdio: 'ignore'
    };
    try {
      (0, (child).spawn)(setupPath, args, spawnOptions).unref();
      app.quit();
    } catch (e) {
      // yes, such errors dispatched not as error event
      // https://github.com/electron-userland/electron-builder/issues/1129
      if (e.code === 'UNKNOWN') {
        console.error('UNKNOWN error code on spawn, will be executed again using elevate');
        try {
          (0, (child).spawn)(path.join(process.resourcesPath, 'elevate.exe'), [setupPath].concat(args), spawnOptions)
            .unref();
        } catch (e2) {
          console.error(e2);
        }
      } else {
        console.error(e);
      }
    }
    return true;
  }
}
