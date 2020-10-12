import {LectioRequest, LectioResponse} from '../LectioRequest'

// @ts-ignore
import cheerio from 'react-native-cheerio';

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

export async function GetDetailedLessonInfo(user: AuthenticatedUser, requestHelper: LectioRequest, lessonId: string): Promise<Lesson> {
  const url = `https://www.lectio.dk/lectio/${user.schoolId}/aktivitet/aktivitetforside2.aspx?absid=${lessonId}&lectab=aktivitetsinformation`;

  const response = await requestHelper.GetLectio(url);

  const $ = cheerio.load(response.data);

  const lesson: Lesson = {
    start: new Date(),
    stop: new Date(),
  };

  
  // ## Parse the date for the lesson
  // In lectio there is the notion of modules and other activities, we use this when parsing the date string
  if ($('div.lectioTabContent tbody tr th:contains("Type:")  ~ td').text().trim() === 'Lektion') {
    lesson.type = LessonType.Module;
    // TODO: This string contains other interresting data such as week and date
    lesson.moduleIndex = ParseModuleIndex(
      $('div.lectioTabContent tbody tr th:contains("Tidspunkt:")  ~ td')
        .text()
        .replace(/[\t\n]+/g, ' ')
        .trim(),
    );
  } else lesson.type = LessonType.Other;

  // Parse the exact date from additional info
  // TODO: This code is copied from GetBriefLessonInfoFromHTML. Perhaps we should extract this functionality into its own function
  {
    const additionalInfo: string = $('[data-additionalinfo]').toArray()[0].attribs['data-additionalinfo'];

    const info =
      additionalInfo.indexOf('\n\n') === -1
        ? additionalInfo.split('\n')
        : additionalInfo.substr(0, additionalInfo.indexOf('\n\n')).split('\n');

    const keywords = ['Lærer', 'Hold', 'Lokale'];

    for (let i = info.length - 1; i >= 0; i--) {
      for (const key of keywords) {
        if (info[i] !== undefined && info[i].indexOf(key) === 0) {
          info.splice(i, 1);
        }
      }
    }

    [lesson.start, lesson.stop] = ParseDateString(info[info.length - 1]);
  }

  // Note - Get the tag of type table with the class ls-table-layout, inside of that get the tbody and inside of the get the last child of type tr and inside of that get the tag of type td
  lesson.note = $('table.ls-table-layout tbody tr:nth-last-child(1) td').text().trim();

  // Title
  lesson.lessonTitle = $('table.ls-table-layout tbody tr:nth-last-child(2) td').text().trim();

  // Students
  lesson.students = $('div.lectioTabContent tbody tr th:contains("Elever:")  ~ td span')
    .toArray()
    .map((p: any) => {
      const student: IStudent = {};
      student.studentId = p.attribs['data-lectiocontextcard'].substring(1);
      student.studentName = $(p).text().substring(0, $(p).text().indexOf(','));
      return student;
    });

  // Teachers
  lesson.teachers = $('div.lectioTabContent tbody tr th:contains("Lærere:")  ~ td span')
    .toArray()
    .map((p: any) => {
      const teacher: ITeacher = {};
      teacher.teacherId = p.attribs['data-lectiocontextcard'].substring(1);
      // TODO: The teacher initials are appended inside parenthethes on the end of the name like this: "John Doe(jodo)"
      //       We should be extracting it and putting it into teacher.teacherInitials
      teacher.teacherName = $(p).text();
      return teacher;
    });

  // Rooms
  const roomsElement = $('div.lectioTabContent tbody tr th:contains("Lokale(r):")  ~ td').toArray()[0];

  if (roomsElement !== undefined) {
    lesson.rooms = roomsElement.children
      .filter((p: CheerioElement) => {
        return p.type === 'text';
      })
      .map((p: CheerioElement) => {
        return p.data === undefined ? '' : p.data.trim();
      });
  }

  // Courses

  // Teams

  // Homework

  // Other

  // Attached files

  // List:
  //  Students, Teachers, Rooms, Courses, Teams, Types, Date from lesson nr.
  //  Homework, Others and attached files
  //  Daily messages, Module times, very far out read geometric position

  return lesson;
}

function ParseModuleIndex(timestring: string): number {
  // The date string could look like this: on 1/4 5. modul , uge 14
  return Number(timestring.substr(timestring.indexOf('. modul') - 1, 1));
}
