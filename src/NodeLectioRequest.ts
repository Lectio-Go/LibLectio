import { LectioRequest, LectioResponse } from './LectioRequest';

import * as qs from 'qs';

let request: any;
if (typeof navigator === 'undefined' || navigator.product !== 'ReactNative') {
  // tslint:disable-next-line
  request = eval("require('request')"); // This is bad
}
export class NodeRequest extends LectioRequest {
  async GetLectio(url: string): Promise<LectioResponse> {
    return new Promise(async (resolve, reject) => {
      request.get(
        {
          url: url,
          jar: true,
        },
        (err: any, res: any) => {
          if (err) reject(err);
          resolve({ data: res.body, headers: res.headers });
        },
      );
    });
  }

  async PostLectio(url: string, body: any): Promise<LectioResponse> {
    return new Promise(async (resolve, reject) => {
      request.post(
        {
          url: url,
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          form: qs.stringify(body),
          jar: true,
          followAllRedirects: true,
        },
        (err: any, res: any) => {
          if (err) reject(err);
          resolve({ data: res.body, headers: res.headers });
        },
      );
    });
  }

  async UploadLectio(url: string, filename: string, data: string): Promise<LectioResponse> {
    return new Promise(async (resolve, reject) => {
      request.post(
        {
          url: url,
          followAllRedirects: true,
          jar: true,
          headers: {
            'sec-fetch-dest': 'iframe',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            referer:
              'https://www.lectio.dk/lectio/165/documentchoosercontent.aspx?year=2020&ispublic=0&showcheckbox=1&mode=pickfile',
          },

          formData: {
            file: {
              value: Buffer.from(data, 'base64'),
              options: {
                filename: filename,
              },
            },
          },
        },
        (err: any, res: any) => {
          if (err) reject(err);
          resolve({ data: res.body, headers: res.headers });
        },
      );
    });
  }
}
