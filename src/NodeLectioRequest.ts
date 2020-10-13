import { LectioRequest, LectioResponse } from './LectioRequest';

import * as qs from 'qs';
import { Cookie, CookieJar } from 'tough-cookie';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import axios from 'axios';
import { rejects } from 'assert';

axiosCookieJarSupport(axios);

export class NodeRequest extends LectioRequest {
  public cookieJar: CookieJar = new CookieJar();

  async GetLectio(url: string): Promise<LectioResponse> {
    return new Promise(async (resolve, reject) => {
      axios
        .get(url, { jar: this.cookieJar, withCredentials: true })
        .then((response) => {
          resolve({ data: response.data, headers: response.headers });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async PostLectio(url: string, body: any): Promise<LectioResponse> {
    return new Promise(async (resolve, reject) => {
      axios
        .post(url, qs.stringify(body), { jar: this.cookieJar, withCredentials: true })
        .then((response) => {
          resolve({ data: response.data, headers: response.headers });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
