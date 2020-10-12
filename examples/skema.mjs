import pkg from '../lib/index.js';
const { AuthenticatedUser, GetBriefTimetable, GetDetailedLessonInfo, NodeRequest} = pkg;
import config from './config.mjs';

const user = new AuthenticatedUser(config.username, config.password, config.schoolID);
const lectioHelper = new NodeRequest();

user
  .Authenticate(lectioHelper)
  .then(async () => {
    //    GetBriefTimetable(user, lectioHelper, 2020, 38).catch((error) => {
    //       console.log(error);
    //     }).then((timetable) => {
    //       console.log(JSON.stringify(timetable, null, 2));
    //     });

    let detailedLessonInfo = await GetDetailedLessonInfo(user, lectioHelper, '43394768400').catch((error) => console.log(error));
    console.log(detailedLessonInfo)
  })
  .catch((error) => {
    console.log(error);
  });
