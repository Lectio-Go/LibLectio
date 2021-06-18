// @ts-ignore
import cheerio from 'react-native-cheerio';
import { getYear, parse } from 'date-fns';

import { LectioRequest, LectioResponse } from '../LectioRequest';
import { AuthenticatedUser } from '../Authentication';
import { IStudent, ITeacher, ITeam } from '../Skema/Timetable';

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

export interface Indlæg {
  tidspunkt: Date;
  bruger: IStudent | ITeacher;
  besked: string;
  dokument?: { navn?: string; url?: string };
}
export interface DetailedOpgave {
  opgavetitel?: string;
  opgavebeskrivelse?: { navn?: string; url?: string };
  opgavenote?: string;
  hold?: ITeam;
  karaterskala?: string;
  ansvarlig?: ITeacher;
  elevtid?: number;
  afleveringsfrist?: Date;
  elev?: IStudent;
  afventer?: string;
  status_fravaer?: string;
  afsluttet?: string;
  karater?: string;
  karaternote?: string;
  elevnote?: string;
  gruppemedlemmer?: IStudent[];
  indlæg?: Indlæg[];
}

export async function hentOpgaver(user: AuthenticatedUser, requestHelper: LectioRequest): Promise<Opgave[]> {
  const opgaver: Opgave[] = [];

  if (!user.isAuthenticated) await user.Authenticate(requestHelper);

  const url = `https://www.lectio.dk/lectio/${user.schoolId}/OpgaverElev.aspx?elevid=${user.studentId}`;

  // We have to make a special request to access all the tasks
  const preOpgaveRequest = await requestHelper.GetLectio(url);
  const pre = cheerio.load(preOpgaveRequest.data);

  const opgaveRequestBody = {
    time: 0,
    __EVENTTARGET: 's$m$Content$Content$ShowThisTermOnlyCB',
    __EVENTARGUMENT: '',
    __LASTFOCUS: '',
    __SCROLLPOSITION: '',
    __VIEWSTATEX: pre('#__VIEWSTATEX').toArray()[0].attribs['value'],
    __VIEWSTATEY_KEY: '',
    __VIEWSTATE: '',
    __VIEWSTATEENCRYPTED: '',
    __EVENTVALIDATION: pre('#__EVENTVALIDATION').toArray()[0].attribs['value'],
    s$m$searchinputfield: '',
    s$m$Content$Content$ShowHoldElementDD: '',
    LectioPostbackId: '',
  };

  const response = await requestHelper.PostLectio(
    `https://www.lectio.dk/lectio/${user.schoolId}/OpgaverElev.aspx?elevid=${user.studentId}`,
    opgaveRequestBody,
  );

  // Now we have all the tasks
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
  opgave.opgavetitel = $('#m_Content_registerAfl_pa tr th:contains("Opgavetitel")  ~ td span').text();
  opgave.opgavenote = $('#m_Content_registerAfl_pa tr th:contains("Opgavenote")  ~ td').text();
  opgave.hold = {
    team: $('#m_Content_registerAfl_pa tr th:contains("Hold")  ~ td span').text(),
    teamId: $('#m_Content_registerAfl_pa tr th:contains("Hold")  ~ td span').attr('data-lectiocontextcard'),
  };
  opgave.karaterskala = $('#m_Content_registerAfl_pa tr th:contains("Karakterskala")  ~ td span').text();
  opgave.ansvarlig = {
    teacherName: $('#m_Content_registerAfl_pa tr th:contains("Ansvarlig")  ~ td span')
      .text()
      .match(/^([^(])+/)![0], // Gets everything before paranthethes
    teacherInitials: $('#m_Content_registerAfl_pa tr th:contains("Ansvarlig")  ~ td span')
      .text()
      .match(/\(([^)]+)\)/)![1], // Gets everything inside paranthethes
    teacherId: $('#m_Content_registerAfl_pa tr th:contains("Ansvarlig")  ~ td span').attr('data-lectiocontextcard'),
  };
  opgave.elevtid = Number(
    $('#m_Content_registerAfl_pa tr th:contains("Elevtid")  ~ td span')
      .text()
      .match(/[^a-zA-Z-\s]/g)![0]
      .replace(',', '.'),
  );
  opgave.afleveringsfrist = parse(
    $('#m_Content_registerAfl_pa tr th:contains("Afleveringsfrist")  ~ td').text(),
    'd/M-yyyy HH:mm',
    new Date(),
  );

  // second table
  opgave.gruppemedlemmer = [];
  $('#m_Content_groupMembersGV span').each((i) => {
    opgave.gruppemedlemmer!.push({
      studentName: $(`#m_Content_groupMembersGV span`)
        .eq(i)
        .text()
        .match(/^([^,])+/g)![0],
      studentClass: $(`#m_Content_groupMembersGV span`)
        .eq(i)
        .text()
        .match(/[^,]*$/g)![0],
      studentId: $(`#m_Content_groupMembersGV span`).eq(i).attr('data-lectiocontextcard'),
    });
  });

  // third table
  const tablethree = $('#m_Content_StudentGV tr td');

  // opgave.elev = tablethree.eq(1).text();
  opgave.afventer = tablethree.eq(2).text();
  opgave.status_fravaer = tablethree.eq(3).text().replace(/\t/g, '').replace(/\n/g, '');
  opgave.afsluttet = tablethree.eq(4).attr('checked');
  opgave.karater = tablethree.eq(5).text().replace(/\t/g, '').replace(/\n/g, '');
  opgave.karaternote = tablethree.eq(6).text().replace(/\t/g, '').replace(/\n/g, '');
  opgave.elevnote = tablethree.eq(7).text().replace(/\t/g, '').replace(/\n/g, '');

  // fourth table
  opgave.indlæg = [];

  $('#m_Content_RecipientGV tr')
    .toArray()
    .forEach((row, index) => {
      if (index === 0) return;
      const rowSelect = cheerio.load(row);
      opgave.indlæg!.push({
        tidspunkt: parse(rowSelect('td').first().text(), 'd/M-yyyy HH:mm', new Date()),
        bruger: {
          studentName: rowSelect(`td span`).first().text(),
          studentId: rowSelect(`td span`).first().attr('data-lectiocontextcard'),
        },
        besked: '',
        dokument: {
          navn: rowSelect(`td span a`).first().text(),
          url: 'https://www.lectio.dk' + rowSelect(`td span a`).first().attr('href'),
        },
      });
    });

  // Opgave beskrivelse
  $('#m_Content_opgaverDS_ctl00_showdocumentHyperlnk')
    .toArray()
    .forEach((row, index) => {
      opgave.opgavebeskrivelse = {
        navn: cheerio
          .load(row)('a')
          .first()
          .text()
          .match(/^([^(])+/)![0]
          .trim(),
        url: 'https://www.lectio.dk' + cheerio.load(row)('a').first().attr('href'),
      };
    });

  return opgave;
}
