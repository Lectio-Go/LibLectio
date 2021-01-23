import pkg from '../lib/index.js';
const { AuthenticatedUser, GetBriefTimetable, GetDetailedLessonInfo, NodeRequest } = pkg;
import config from './config.mjs';

const user = new AuthenticatedUser(config.username, config.password, config.schoolID);
const lectioHelper = new NodeRequest();

GetBriefTimetable(user, lectioHelper, 2021, 3).catch((error) => {
  console.log(error);
}).then(async (timetable) => {
  console.log(JSON.stringify(timetable, null, 2));
  let detailedLessonInfo = await GetDetailedLessonInfo(user, lectioHelper, '43394768400');
  console.log(detailedLessonInfo)
}).catch((err)=> {
  console.log("ERROR: " + err)
})