import pkg from '../lib/index.js';
const { AuthenticatedUser, GetBriefTimetable, GetDetailedLessonInfo, NodeRequest} = pkg;
import config, {image} from './config.mjs';

const user = new AuthenticatedUser(config.username, config.password, config.schoolID);
const lectioHelper = new NodeRequest();

lectioHelper.UploadLectio("https://httpbin.org/post", "myimage.jpg", image).then(response => {
    console.log(response.data);
}).catch(error => {
    console.log("Error: " + error)
})


// user.Authenticate(lectioHelper)
//   .then(async () => {
//         // GetBriefTimetable(user, lectioHelper, 2020, 48).catch((error) => {
//         //    console.log(error);
//         //  }).then((timetable) => {
//         //    console.log(JSON.stringify(timetable, null, 2));
//         //  });
//     let detailedLessonInfo = await GetDetailedLessonInfo(user, lectioHelper, '43394768400');
//     console.log(detailedLessonInfo)
//   })
//   .catch((error) => {
//     console.log("ERROR: " + error.message);
//   });
