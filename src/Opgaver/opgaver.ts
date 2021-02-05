// @ts-ignore
import cheerio from 'react-native-cheerio';
import { parse } from 'date-fns';

import { LectioRequest, LectioResponse } from '../LectioRequest';
import { AuthenticatedUser } from '../Authentication';

export interface Opgave {
  uge?: string;
  hold?: string;
  opgavetitel?: string;
  id?: string;
  frist?: string;
  elevtid?: string;
  status?: string;
  fravaer?: string;
  afventer?: string;
  opgavenote?: string;
  karater?: string;
  elevnote?: string;
}

export interface DetailedOpgave {
  opgavetitel?: string;
  opgavebeskrivelse?: string;
  opgavenote?: string;
  hold?: string;
  karaterskala?: string;
  ansvarlig?: string;
  elevtid?: string;
  afleveringsfrist?: string;
  elev?: string;
  afventer?: string;
  status_fravaer?: string;
  afsluttet?: string;
  karater?: string;
  karaternote?: string;
  elevnote?: string;
  gruppemedlemmer?: string[];
  afleveret_tidspunkt?: string;
  afleveret_bruger?: string;
  indlaeg?: string;
  afleveret_dokument?: string;
}

export async function hentOpgaver(user: AuthenticatedUser, requestHelper: LectioRequest): Promise<Opgave[]> {
  const opgaver: Opgave[] = [];

  if (!user.isAuthenticated) await user.Authenticate(requestHelper);

  const url = `https://www.lectio.dk/lectio/${user.schoolId}/OpgaverElev.aspx?elevid=${user.studentId}`;

  const response = await requestHelper.GetLectio(url);

  const $ = cheerio.load(response.data);

  for (const k of $('#printStudentAssignmentsArea tr').toArray()) {
    const whoKnows = cheerio.load(k);
    const opgave: Opgave = {};
    opgave.uge = whoKnows('td:nth-child(1) span').text();
    opgave.hold = whoKnows('td:nth-child(2) span').text();
    opgave.opgavetitel = whoKnows('td:nth-child(3) span').text();

    const yeet = whoKnows('td:nth-child(3) span').html();
    if (yeet !== null) {
      opgave.id = yeet.substring(yeet.lastIndexOf('exerciseid=') + 11, yeet.lastIndexOf('&amp;prevurl'));
    }
    opgave.frist = parse(whoKnows('td:nth-child(4)').text(), 'd/M-yyyy HH:mm', new Date()).toString();
    opgave.elevtid = whoKnows('td:nth-child(5)').text();
    opgave.status = whoKnows('td:nth-child(6)').text();
    opgave.fravaer = whoKnows('td:nth-child(7)').text();
    opgave.afventer = whoKnows('td:nth-child(8)').text();
    opgave.opgavenote = whoKnows('td:nth-child(9)').text();
    opgave.karater = whoKnows('td:nth-child(10)').text();
    opgave.elevnote = whoKnows('td:nth-child(11)').text();
    opgaver.push(opgave);
  }

  opgaver.shift();

  return opgaver;
}

export async function detailedOpgaver(
  user: AuthenticatedUser,
  requestHelper: LectioRequest,
  exerciseid: string,
): Promise<DetailedOpgave> {
  const opgave: DetailedOpgave = {};

  if (!user.isAuthenticated) await user.Authenticate(requestHelper);

  const url = `https://www.lectio.dk/lectio/${user.schoolId}/ElevAflevering.aspx?elevid=${user.studentId}&exerciseid=${exerciseid}`;

  const response = await requestHelper.GetLectio(url);

  const $ = cheerio.load(response.data);

  // the first table
  const tableone = $('#m_Content_registerAfl_pa tr td');
  // if the exercise do not have an "opgavebesrivelse"
  if (tableone.length === 8) {
    opgave.opgavetitel = tableone.eq(0).text();
    opgave.opgavenote = tableone.eq(1).text();
    opgave.hold = tableone.eq(2).text();
    opgave.karaterskala = tableone.eq(3).text();
    opgave.ansvarlig = tableone.eq(4).text();
    opgave.elevtid = tableone.eq(5).text();
    opgave.afleveringsfrist = tableone.eq(6).text();
  }
  // if the exercise has an "opgavebesrivelse"
  if (tableone.length === 9) {
    opgave.opgavetitel = tableone.eq(0).text();

    let yeeti = tableone.eq(1).html();

    if (yeeti !== null) {
      yeeti = yeeti.replace(/\t/g, '').replace(/\n/g, '');
      opgave.opgavebeskrivelse = yeeti
        .substring(yeeti.lastIndexOf(' href="') + 7, yeeti.lastIndexOf('"><img'))
        .replace('amp;', '');
    }

    opgave.opgavenote = tableone.eq(2).text();
    opgave.hold = tableone.eq(3).text();
    opgave.karaterskala = tableone.eq(4).text();
    opgave.ansvarlig = tableone.eq(5).text();
    opgave.elevtid = tableone.eq(6).text();
    opgave.afleveringsfrist = tableone.eq(7).text();
  }

  // second table
  const tabletwo = $('#m_Content_groupMembersGV tr');
  opgave.gruppemedlemmer = [];
  for (let i = 1; i < tabletwo.length; i++) {
    opgave.gruppemedlemmer.push(tabletwo.eq(i).text().replace(/\t/g, '').replace(/\n/g, ''));
  }

  // third table
  const tablethree = $('#m_Content_StudentGV tr td');

  opgave.elev = tablethree.eq(1).text();
  opgave.afventer = tablethree.eq(2).text();
  opgave.status_fravaer = tablethree.eq(3).text().replace(/\t/g, '').replace(/\n/g, '');
  opgave.afsluttet = tablethree.eq(4).attr('checked');
  opgave.karater = tablethree.eq(5).text().replace(/\t/g, '').replace(/\n/g, '');
  opgave.karaternote = tablethree.eq(6).text().replace(/\t/g, '').replace(/\n/g, '');
  opgave.elevnote = tablethree.eq(7).text().replace(/\t/g, '').replace(/\n/g, '');

  // fourth table
  const tablefour = $('#m_Content_RecipientGV tr td');

  opgave.afleveret_tidspunkt = tablefour.eq(0).text();
  opgave.afleveret_bruger = tablefour.eq(1).text();
  opgave.indlaeg = tablefour.eq(2).text();

  let yeet = tablefour.eq(3).html();

  if (yeet !== null) {
    yeet = yeet.replace(/\t/g, '').replace(/\n/g, '');
    opgave.afleveret_dokument = yeet
      .substring(yeet.lastIndexOf('"><a href="') + 11, yeet.lastIndexOf('"><img'))
      .replace('amp;', '');
  }

  return opgave;
}
