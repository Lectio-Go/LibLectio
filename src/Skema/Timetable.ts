import parse from 'date-fns/parse';

export * from './HentSkemaUge';
export * from './HentLektionInfo';

export enum LessonState {
  Cancelled = 'Cancelled',
  Changed = 'Changed',
  Exam = 'Exam',
  Normal = 'Normal',
}

export enum LessonType {
  Module = 'Lektion',
  Other = 'Anden aktivitet',
}

export interface ITeacher {
  teacherName?: string;
  teacherInitials?: string;
  teacherId?: string;
}

export interface IStudent {
  studentName?: string;
  studentId?: string;
  studentClass?: string;
}

export interface ITeam {
  team?: string;
  teamId?: string;
}

export interface IRoom {
  room?: string;
  roomId?: string; // This will be hard to get, because the room id is not listed in the lesson
}

export interface ICourse {
  course?: string;
  courseId?: string;
}

export interface Lesson {
  start: Date;
  stop: Date;

  lessonTitle?: string;
  lessonId?: string;
  state?: LessonState;
  type?: LessonType;

  // I know this is somewhat redundant if there is a better solution feel free to change it
  moduleIndex?: number;

  teams?: ITeam[];
  teachers?: ITeacher[];
  students?: IStudent[];
  course?: ICourse[];

  rooms?: string[];

  homeworkBrief?: string;
  otherBrief?: string;
  noteBrief?: string;

  homework?: string;
  other?: string;
  note?: string;
}

export interface TimetableWeek {
  year: number;
  week: number;
  mon: Lesson[];
  tue: Lesson[];
  wed: Lesson[];
  thu: Lesson[];
  fri: Lesson[];
  sat: Lesson[];
  sun: Lesson[];
  dailyMessage: string[];
  moduleTimes: { index: number; start: Date; stop: Date }[];
}

export function ParseDateString(datestr: string): [Date, Date] {
  // A date string looks like this: 28/2-2020 08:15 til 09:15
  // Neither day nor month is zeropadded

  const startDateStr = datestr.substring(0, datestr.indexOf(' til '));
  const endTimeStr = datestr.substring(datestr.indexOf(' til ') + 5, datestr.length);
  const endDateStr = startDateStr.substring(0, startDateStr.length - 5) + endTimeStr;

  const startDate = parse(startDateStr, 'd/M-yyyy HH:mm', new Date());
  const endDate = parse(endDateStr, 'd/M-yyyy HH:mm', new Date());

  // console.log("start: "+startDate.toTimeString())
  // console.log("stop: "+endDate.toTimeString())

  return [startDate, endDate];
}
