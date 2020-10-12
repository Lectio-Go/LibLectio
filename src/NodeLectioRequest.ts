import {LectioRequest, LectioResponse} from './LectioRequest'

import * as qs from 'qs';
import { Cookie, CookieJar } from 'tough-cookie'
import axiosCookieJarSupport from 'axios-cookiejar-support';
import axios from 'axios'

axiosCookieJarSupport(axios);

export class NodeRequest extends LectioRequest {
    public cookieJar: CookieJar = new CookieJar();

    async GetLectio(url: string) : Promise<LectioResponse> {
        return new Promise(async (resolve) => {
            const get_request = await axios.get(url, {
                jar: this.cookieJar,
                withCredentials: true,
              });

            resolve({data: get_request.data, headers: get_request.headers})
        });  
    }

    async PostLectio(url: string, body: any) : Promise<LectioResponse> {
        console.log(body)
        return new Promise(async (resolve) => {
            const post_request = await axios.post(url, qs.stringify(body), {
                jar: this.cookieJar,
                withCredentials: true,
              });

            resolve({data: post_request.data, headers: post_request.headers})
        });        
    }

    async GetCookies() : Promise<Map<string, string>> {
        return new Promise(async (resolve) => {
            const cookies: Map<string, string> = new Map<string, string>()

            this.cookieJar.toJSON().cookies.forEach((cookie: Cookie.Serialized) => {
                cookies.set(cookie.key, cookie.value);
            })

            resolve(cookies)
        });  
    }
}