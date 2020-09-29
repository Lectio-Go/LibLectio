import pkg from '../lib/index.js';
const {AuthenticatedUser, GetBriefTimetable, GetDetailedLessonInfo} = pkg;
import config from './config.mjs';

const user = new AuthenticatedUser(config.username, config.password, config.schoolID);

user
  .Authenticate()
  .then(() => {

console.log(user.cookie)
//    GetBriefTimetable(user, 2020, 38).catch((error) => {
//       console.log(error);
//     }).then((timetable) => {
//       console.log(JSON.stringify(timetable, null, 2));
//     });

    GetDetailedLessonInfo(user, '43394768400').catch((error) => console.log(error));
  })
  .catch((error) => {
    console.log(error);
  });
