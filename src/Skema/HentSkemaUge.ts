import { LectioRequest, LectioResponse } from '../LectioRequest';

// @ts-ignore
import cheerio from 'react-native-cheerio';
import { getDay, getISODay, parse } from 'date-fns';

import { AuthenticatedUser } from '../Authentication';
import {
  TimetableWeek,
  Lesson,
  LessonState,
  LessonType,
  ParseDateString,
  ITeacher,
  ITeam,
  ICourse,
  IStudent,
} from './Timetable';

// This provides som details on each lesson but it might be incorrect. To ensure correct info use the GetDetailedTimetable instead.
export async function HentSkemaUge(
  user: AuthenticatedUser,
  requestHelper: LectioRequest,
  year: number,
  week: number,
): Promise<TimetableWeek> {
  const timetable: TimetableWeek = {
    year: year,
    week: week,
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: [],
    dailyMessage: [],
    moduleTimes: [],
  };

  // Check if user is authenticated
  if (!user.isAuthenticated) await user.Authenticate(requestHelper);

  // First we have to request the proper page, therefore we need the url
  // Because a week needs to be 2 digits we will have to pad a zero in front if the week number is less than 10
  const weekstr: string = week < 10 ? '0' + week : String(week);

  const url = `https://www.lectio.dk/lectio/${user.schoolId}/SkemaNy.aspx?type=elev&elevid=${user.studentId}&week=${weekstr}${year}`;

  // Now we are ready to make the request
  const response = await requestHelper.GetLectio(url);

  const $ = cheerio.load(response.data);

  for (const elem of $('.s2skemabrik.s2bgbox').toArray()) {
    const lesson = GetBriefLessonInfoFromHTML(elem);

    switch (getISODay(lesson.start)) {
      case 1:
        timetable.mon.push(lesson);
        break;
      case 2:
        timetable.tue.push(lesson);
        break;
      case 3:
        timetable.wed.push(lesson);
        break;
      case 4:
        timetable.thu.push(lesson);
        break;
      case 5:
        timetable.fri.push(lesson);
        break;
      case 6:
        timetable.sat.push(lesson);
        break;
      case 7:
        timetable.sun.push(lesson);
        break;
    }
  }

  for (const elem of $('.s2module-info div').toArray()) {
    const moduleTimeString: string = cheerio(elem).html()!; // Looks like this: 1. modul<br>8:15 - 9:15

    const moduleIndex = moduleTimeString.substring(0, moduleTimeString.indexOf('. modul<br>'));
    const timeInterval = moduleTimeString.substring(moduleTimeString.indexOf('. modul<br>') + 11);
    const startTime = parse(timeInterval.substring(0, timeInterval.indexOf(' - ')), 'H:m', 0);
    const stopTime = parse(timeInterval.substring(timeInterval.indexOf(' - ') + 3), 'H:m', 0);

    timetable.moduleTimes.push({ index: Number(moduleIndex), start: startTime, stop: stopTime });
  }

  return timetable;
}

function GetBriefLessonInfoFromHTML(html: CheerioElement): Lesson {
  const lesson: Lesson = {
    start: new Date(),
    stop: new Date(),
  };

  // To extract the date from the additional info we make some assumptions
  // For one we know that there is a double newline before the note/homework/other text
  // Before that there is some lesson info like the team/teacher and room. And before that there is always the date
  // We can definitely not assume the date will be first
  const additionalInfo = html.attribs['data-additionalinfo'];
  const info =
    additionalInfo.indexOf('\n\n') === -1
      ? additionalInfo.split('\n')
      : additionalInfo.substr(0, additionalInfo.indexOf('\n\n')).split('\n');

  const keywords = ['Lærer', 'Hold', 'Lokale'];

  for (let i = info.length - 1; i >= 0; i--) {
    for (const key of keywords) {
      if (info[i] !== undefined && info[i].indexOf(key) === 0) {
        // This way of finding rooms doesn't account for multiple rooms, but should instead be found from the detailed lesson info function
        if (key === 'Lokale')
          lesson.rooms = info[i]
            .substring('Lokale: '.length)
            .split(',')
            .map((val: string) => {
              return val.trim();
            });

        info.splice(i, 1);
      }
    }
  }

  [lesson.start, lesson.stop] = ParseDateString(info[info.length - 1]);

  // First we check whether this lesson actually has got any notes, homework or other
  if (additionalInfo.indexOf('\n\n') !== -1)
    [lesson.homeworkBrief, lesson.otherBrief, lesson.noteBrief] = ParseNoteHomeworkOther(
      additionalInfo.substring(additionalInfo.indexOf('\n\n') + 2),
    );

  /* tslint:disable:no-string-literal */
  lesson.lessonId = ParseLessonIdFromHref(html.attribs['href']);
  lesson.state = ParseStateFromClasses(html.attribs['class']);
  /* tslint:enable:no-string-literal */

  let title = '';
  [lesson.teachers, lesson.teams, title] = ParseDataContextCards(
    cheerio.load(html)('span', '.s2skemabrikcontent').toArray(),
  );

  if (title !== '') {
    lesson.lessonTitle = title;
  }

  return lesson;
}

function ParseStateFromClasses(classes: string): LessonState {
  // A classes string typically looks like this:
  //      s2skemabrik s2bgbox s2bgboxeksamen s2withlink lec-context-menu-instance
  // Or
  //      s2skemabrik s2bgbox s2changed s2withlink lec-context-menu-instance

  // TODO: I don't know how this would handle a cancelled exam, perhaps lesson state should be stored as an array

  if (classes.indexOf('s2cancelled') !== -1) return LessonState.Cancelled;
  if (classes.indexOf('s2changed') !== -1) return LessonState.Changed;
  if (classes.indexOf('s2bgboxeksamen') !== -1) return LessonState.Exam;

  return LessonState.Normal;
}

function ParseLessonIdFromHref(href: string): string {
  // An href to a lesson typically looks like this:
  //  /lectio/143/aktivitet/aktivitetforside2.aspx?absid=40325672321&prevurl=SkemaNy.aspx%3ftype%3delev%26elevid%3d31486565135%26week%3d142029&elevid=31434204135
  // Although it doesn't need the extra arguments after:
  // /lectio/123/aktivitet/aktivitetforside2.aspx?absid=40735672953

  if (href.substring(href.indexOf('absid=')).indexOf('&') === -1) return href.substring(href.indexOf('absid='));
  else return href.substr(href.indexOf('absid=') + 6, href.substring(href.indexOf('absid=') + 6).indexOf('&'));
}

function ParseDataContextCards(contextCards: CheerioElement[]): [ITeacher[], ITeam[], string] {
  // The datacontextcard is an array on spans in an html tag like this:
  /*
    <div class="s2skemabrikcontent s2changed">
    <span style="word-wrap:break-word;">Teknologiværksted</span><br>
    <span data-lectiocontextcard="HE31684337422">S 2u Ti</span> 
    <span data-lectiocontextcard="HE34394554549">S 2x Ti</span> 
    <span data-lectiocontextcard="HE31695660521">S 2y Ti</span> 
    <span data-lectiocontextcard="HE31683454720">S 2z TI</span>
    <img alt="" src="/lectio/img/transparent.png" class="s2seperator">
     <span data-lectiocontextcard="T26546323827">jhmo</span> 
    <span data-lectiocontextcard="T26546202344">maho</span> 
    <span data-lectiocontextcard="T29670238343">miws</span> 
    <span data-lectiocontextcard="T26546121332">pchr</span>
    </div>
    */

  const teachers: ITeacher[] = [];
  const teams: ITeam[] = [];
  let title: string = '';

  for (const card of contextCards) {
    if (card.attribs['data-lectiocontextcard'] !== undefined) {
      if (card.attribs['data-lectiocontextcard'].substring(0, 2) === 'HE') {
        // We have a team
        teams.push({
          team: card.children[0].data,
          teamId: card.attribs['data-lectiocontextcard'].substring(2),
        });
      } else if (card.attribs['data-lectiocontextcard'].substring(0, 1) === 'T') {
        // We have a teacher
        teachers.push({
          teacherName: undefined,
          teacherInitials: card.children[0].data,
          teacherId: card.attribs['data-lectiocontextcard'].substring(1),
        });
      } else {
        console.log('Unknown data attribute: ' + card.attribs['data-lectiocontextcard']);
      }
    } else title = card.children[0].data !== undefined ? card.children[0].data : '';
  }

  return [teachers, teams, title];
}

function ParseNoteHomeworkOther(info: string): [string, string, string] {
  // Lectio always prints the teachers messages in the order of: homework, other and note
  // Following one of these sections there are 2 linebreaks
  // Homework:
  let homework = '';
  let otherExists = true;
  if (info.indexOf('Lektier:\n') === 0) {
    if (info.indexOf('\n\nØvrigt indhold:\n') !== -1) {
      homework = info.substring(9, info.indexOf('\n\nØvrigt indhold:\n'));
      info = info.substring(info.indexOf('\n\nØvrigt indhold:\n') + 2);
    } else if (info.indexOf('\n\nNote:\n') !== -1) {
      otherExists = false;
      homework = info.substring(9, info.indexOf('\n\nNote:\n'));
      info = info.substring(info.indexOf('\n\nNote:\n') + 2);
    } else {
      homework = info.substring(9);
      return [homework, '', ''];
    }
  }

  // Other
  let other = '';
  let noteExits = true;
  if (otherExists && info.indexOf('Øvrigt indhold:\n') === 0) {
    if (info.indexOf('\n\nNote:\n') !== -1) {
      other = info.substring(16, info.indexOf('\n\nNote:\n'));
      info = info.substring(info.indexOf('\n\nNote:\n') + 2);
    } else noteExits = false;
  }

  // Note
  let note = '';
  if (noteExits && info.indexOf('Note:\n') === 0) {
    note = info.substring(6);
  }

  return [homework, other, note];
}
