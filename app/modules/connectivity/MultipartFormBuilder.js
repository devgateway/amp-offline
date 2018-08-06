/**
 * Multipart Form Builder
 *
 * @author Nadejda Mandrescu
 */
export default class MultipartFormBuilder {

  constructor() {
    this.data = [];
  }

  /**
   * Add a simple JSON form parameter
   * @param fieldName
   * @param value
   * @return {MultipartFormBuilder}
   */
  addJsonParam(fieldName, value) {
    this.data.push({
      'Content-Disposition': `form-data; name="${fieldName}"`,
      'Content-Type': 'application/json',
      body: JSON.stringify(value)
    });
    return this;
  }

  /**
   * Add a file form parameter
   * @param fieldName
   * @param filename
   * @param contentType
   * @param fileReadStream
   * @return {MultipartFormBuilder}
   */
  addFileParam(fieldName, filename, contentType, fileReadStream) {
    this.data.push({
      'Content-Disposition': `form-data; name="${fieldName}"; filename="${filename}"`,
      'Content-Type': contentType,
      body: fileReadStream
    });
    return this;
  }

  getMultipartForm() {
    return {
      chunked: true,
      data: this.data
    };
  }

}
