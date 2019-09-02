// import AdmArchive from '../archiver/AdmArchive';
import YazlArchive from '../archiver/YazlArchive';

/**
 * This abstraction layer allows to switch to a different archive library.
 * E.g. I initially tried 'adm-zip' with simpler API, but it had issues.
 * @author Nadejda Mandrescu
 */
// export default class Archiver extends AdmArchive {
export default class Archiver extends YazlArchive {
}
