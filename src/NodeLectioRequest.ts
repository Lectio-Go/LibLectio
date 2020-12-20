import { LectioRequest, LectioResponse } from './LectioRequest';

import * as qs from 'qs';

import request from 'request'

export class NodeRequest extends LectioRequest {
  async GetLectio(url: string): Promise<LectioResponse> {
    return new Promise(async (resolve, reject) => {
      request.get({
        url: url,
        jar: true
      }, (err, res) => {
        if (err)
          reject(err);
        resolve({ data: res.body, headers: res.headers });
      });
    });
  }

  async PostLectio(url: string, body: any): Promise<LectioResponse> {
    return new Promise(async (resolve, reject) => {
      request.post({
        url: url,
        headers: {'content-type' : 'application/x-www-form-urlencoded'},
        form: qs.stringify(body),
        jar: true,
        followAllRedirects: true
      }, (err, res) => {
        if (err)
          reject(err);
        resolve({ data: res.body, headers: res.headers });
      });
    });
  }

  async UploadLectio(url: string, filename: string, data: string): Promise<LectioResponse> {
    return new Promise(async (resolve, reject) => {
      request({
        url: url,
        method: 'POST',
        followAllRedirects: true,
        jar: true,
        formData: {
          'file': {
            value: Buffer.from(data, 'base64'),
            options: {
              filename: filename
            }
          }
        }
      }, (err, res) => {
        if (err)
          reject(err);
        resolve({ data: res.body, headers: res.headers });
      });
    });
  }
}
