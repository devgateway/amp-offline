/**
 * Created by JulianEduardo on 20/4/2017.
 */
import { ASSEST_DIRECTORY, BASE_64_PNG_PREFIX, TRANSPARENT_FLAG } from './Constants';
import FileManager from '../modules/util/FileManager';

class AssetsUtils {
  static loadImage(img) {
    // read binary data
    if (FileManager.existsSync(ASSEST_DIRECTORY, img)) {
      const bitmap = FileManager.readBinaryDataFileSync(ASSEST_DIRECTORY, img);
      return BASE_64_PNG_PREFIX + new Buffer(bitmap).toString('base64');
    } else {
      return BASE_64_PNG_PREFIX + TRANSPARENT_FLAG;
    }
  }
}

export default AssetsUtils;
