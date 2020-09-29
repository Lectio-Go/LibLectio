import axios from 'axios';
import * as qs from 'qs';

export interface IAuthenticationResponse {
  text: string;
  cookies: string;
}

export interface IRequestBody {
  __EVENTARGUMENT?: string;
  __EVENTVALIDATION?: string;
  __EVENTTARGET?: string;
  __VIEWSTATEY_KEY?: string;
  __VIEWSTATE?: string;
  __VIEWSTATEX?: string;
  m$Content$password: string;
  m$Content$username: string;
}

export class AuthenticatedUser {
  constructor(username: string, password: string, schoolId: string) {
    this.m_username = username;
    this.m_password = password;
    this.m_schoolId = schoolId;
  }

  // Private
  private m_username: string;
  private m_password: string;
  private m_schoolId: string;
  private m_studentId: string = '';
  private m_authenticationCookie: string = '';
  private m_lastAuthenticated: Date = new Date();

  // Public
  public get cookie(): string {
    return this.m_authenticationCookie;
  }

  public get studentId(): string {
    return this.m_studentId;
  }

  public get schoolId(): string {
    return this.m_schoolId;
  }

  public get isAuthenticated(): boolean {
    // We get a timeout after 2340 seconds and a warning after 1800 seconds as shown by running  window.SessionHelper.Instance._secondsUntilTimeout in the lectio javascript console
    // Therefore we are not authenticated after that period and need to relogin
    if (this.m_authenticationCookie === '') return false;
    else if (Date.now() - this.m_lastAuthenticated.getTime() >= 2340e3)
      // We are no longer authenticated and need to relogin
      return false;
    else return true;
  }

  async Authenticate(
    postRequestGetCookies = (url: string, body: IRequestBody, cookies: string): Promise<IAuthenticationResponse> => {
      return new Promise(() => {
        return null;
      });
    },
  ) {
    console.log('Authenticating user');

    try {
      // Authenticating with lectio requires an asp.net session cookie + the proper view state headers
      // Therefore we need to load any page and get the info needed to login
      const url = 'https://www.lectio.dk/lectio/' + this.m_schoolId + '/login.aspx';

      const prelogin_request = await axios.get(url, { withCredentials: true });
      console.log();

      const request_body = this.ExtractRequestBody(prelogin_request.data);

      // If react native, we should call a native implementation for the login
      // because fetch doesn't allow for manual redirection which means that
      // the set-cookie header is lost when we get redirected to the front page after the post request
      if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        // I'm in react-native
        if (prelogin_request.headers['set-cookie'][0].indexOf('ASP.NET_SessionId') === -1)
          throw Error('Unsuccesful authentication');

        const login_request = await postRequestGetCookies(url, request_body, prelogin_request.headers['set-cookie'][0]);

        // We have successful authentication
        if (login_request.cookies.indexOf('LastLoginUserName') !== -1) {
          this.m_authenticationCookie = login_request.cookies;
          this.m_lastAuthenticated = new Date();

          this.m_studentId = login_request.text.substring(
            login_request.text.indexOf('elevid=') + 7,
            login_request.text.indexOf('"', login_request.text.indexOf('elevid=')),
          );
        } else throw Error('Unsuccesful authentication');
      } else {
        // I'm in node js
        const { CookieJar } = await import('tough-cookie');
        const axiosCookieJarSupport = await import('axios-cookiejar-support');

        function FindKeyInCookiejar(key: string, jar: any): boolean {
          return jar.toJSON().cookies.some((cookie: any) => cookie.key === key);
        }

        axiosCookieJarSupport.default(axios);
        const cookieJar = new CookieJar();

        const login_request = await axios.post(url, qs.stringify(request_body), {
          jar: cookieJar,
          withCredentials: true,
        });

        if (FindKeyInCookiejar('LastLoginUserName', cookieJar)) {
          // We have successful authentication
          this.m_authenticationCookie = cookieJar.getCookieStringSync('https://www.lectio.dk');
          this.m_lastAuthenticated = new Date();

          this.m_studentId = login_request.data.substring(
            login_request.data.indexOf('elevid=') + 7,
            login_request.data.indexOf('"', login_request.data.indexOf('elevid=')),
          );

          return;
        } else throw Error('Unsuccesful authentication');
      }
    } catch (error) {
      throw error;
    }
  }

  ExtractRequestBody(page_body: string): IRequestBody {
    // These headers are required but can be hardcoded in, because they don't change.
    const requestBody: IRequestBody = {
      __EVENTARGUMENT: '',
      __EVENTVALIDATION: '',
      __EVENTTARGET: 'm$Content$submitbtn2',
      __VIEWSTATEY_KEY: '',
      __VIEWSTATE: '',
      __VIEWSTATEX: '',
      m$Content$password: this.m_password,
      m$Content$username: this.m_username,
    };

    // We need to extract the viewstate and the eventvalidation from the html login page
    const viewstatestartindex = page_body.indexOf(`id="__VIEWSTATEX" value=`) + 25;
    const viewstatelastindex = page_body.indexOf(`"`, viewstatestartindex);
    if (viewstatestartindex === -1 || viewstatelastindex === -1) throw Error('Unable to find viewstate in page body');

    requestBody.__VIEWSTATEX = page_body.substring(viewstatestartindex, viewstatelastindex);

    const eventvalidationstartindex = page_body.indexOf('id="__EVENTVALIDATION" value=') + 30;
    const eventvalidationlastindex = page_body.indexOf('"', eventvalidationstartindex);
    if (eventvalidationstartindex === -1 || eventvalidationlastindex === -1)
      throw Error('Unable to find eventvalidation in page body');

    requestBody.__EVENTVALIDATION = page_body.substring(eventvalidationstartindex, eventvalidationlastindex);
    return requestBody;
  }
}
