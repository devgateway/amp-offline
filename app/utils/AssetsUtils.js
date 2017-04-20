/**
 * Created by JulianEduardo on 20/4/2017.
 */
import fs from 'fs';
import { TRANSPARENT_FLAG, BASE_64_PNG_PREFIX } from './Constants';

class AssetsUtils {
  static loadImage(img) {
    // read binary data
    if (fs.existsSync(img)) {
      const bitmap = fs.readFileSync(img);
      return BASE_64_PNG_PREFIX + new Buffer(bitmap).toString('base64');
    } else {
      return BASE_64_PNG_PREFIX + TRANSPARENT_FLAG;
    }
  }
}
export default AssetsUtils;
