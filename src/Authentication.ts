import { LectioRequest, LectioResponse } from './LectioRequest';

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
    if (new Date().getTime() - this.m_lastAuthenticated.getTime() <= 2340e3) {
      return false; // We are no longer authenticated and need to relogin
    } else {
      return true;
    }
  }

  async Authenticate(requestHelper: LectioRequest) {
    console.log('Authenticating user');

    try {
      // Authenticating with lectio requires an asp.net session cookie + the proper view state headers
      // Therefore we need to load any page and get the info needed to login
      const url = 'https://www.lectio.dk/lectio/' + this.m_schoolId + '/login.aspx';

      const prelogin_request = await requestHelper.GetLectio(url);
      const request_body = this.ExtractRequestBody(prelogin_request.data);

      const login_request = await requestHelper.PostLectio(url, request_body);

      if (login_request.data.includes('Skolen eksisterer ikke')) throw new Error('School does not exist');

      if (login_request.data.includes('Fejl i Brugernavn og/eller adgangskode'))
        throw new Error('Incorrect login credentials');

      if (login_request.data.includes('Der er ikke oprettet en adgangskode til dette login.'))
        throw new Error('No password for for this login');

      // We have successful authentication
      this.m_lastAuthenticated = new Date();
      this.m_studentId = login_request.data.substring(
        login_request.data.indexOf('elevid=') + 7,
        login_request.data.indexOf('"', login_request.data.indexOf('elevid=')),
      );
    } catch (error) {
      return new Promise(async (resolve, reject) => {
        reject(error);
      });
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
