export interface LectioResponse {
  data: string;
  headers: any;
}

/**
 * Base class for implementing networking to Lectio.
 * Any class inheriting from this should implement the singleton pattern, to keep session data like cookies
 */
export abstract class LectioRequest {
  /**
   * This function makes GET-requests to Lectio, and decodes the response as UTF-8.
   * If you want to get binary data, you should use the `DownloadLectio` method.
   */
  abstract async GetLectio(url: string): Promise<LectioResponse>;

  /**
   * Used to make POST-requests to Lectio, which is often useful for setting the state of eg. checkboxes.
   * @param url - Target URL for the POST request
   * @param body - Any flat key-value object map
   */
  abstract async PostLectio(url: string, body: any): Promise<LectioResponse>;

  /**
   * This function is used to make multipart form uploads to Lectio.
   * @param url - The target for the POST-reqeust
   * @param filename - The name of the uploaded file.
   * @param data - The file data encoded with Base64
   */
  abstract async UploadLectio(url: string, filename: string, data: string): Promise<LectioResponse>;

  /**
   * This function makes GET-requests to Lectio, and returns the binary response as Base64.
   * It is recommended to use this function when downloading files
   */
  abstract async DownloadLectio(url: string): Promise<LectioResponse>;
}
