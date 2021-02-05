// @ts-ignore
import cheerio from 'react-native-cheerio';
import { parse } from 'date-fns';

import { LectioRequest, LectioResponse } from '../LectioRequest';
import { AuthenticatedUser } from '../Authentication';

export interface Fravær {
  hold?: string;
  opgjortprocent?: string;
  opgjortmoduler?: string;
  standardårprocent?: string;
  standardårmoduler?: string;
  skriftligopgjortprocent?: string;
}

export async function hentFravær(user: AuthenticatedUser, requestHelper: LectioRequest): Promise<Fravær[]> {
  const opgaver: Fravær[] = [];

  if (!user.isAuthenticated) await user.Authenticate(requestHelper);

  const url = `https://www.lectio.dk/lectio/${user.schoolId}/subnav/fravaerelev.aspx?elevid=${user.studentId}`;
  const response = await requestHelper.GetLectio(url);

  const $ = cheerio.load(response.data);

  $('#s_m_Content_Content_SFTabStudentAbsenceDataTable tr')
    .toArray()
    .forEach((k, i) => {
      if (i < 3) return;

      const whoKnows = cheerio.load(k);
      const fravær: Fravær = {};

      fravær.hold = whoKnows('td:nth-child(1)').text();
      fravær.opgjortprocent = whoKnows('td:nth-child(4)').text();
      fravær.opgjortmoduler = whoKnows('td:nth-child(5)').text();
      fravær.standardårprocent = whoKnows('td:nth-child(6)').text();
      fravær.standardårmoduler = whoKnows('td:nth-child(7)').text();
      fravær.skriftligopgjortprocent = whoKnows('td:nth-child(10)').text();

      opgaver.push(fravær);
    });

  opgaver.shift();

  return opgaver;
}
