import pkg, { UploadDocument } from '../lib/index.js';
const { AuthenticatedUser, GetBriefTimetable, GetDetailedLessonInfo, NodeRequest} = pkg;
import config, {image} from './config.mjs';

import path from 'path'
import fs from 'fs'


const user = new AuthenticatedUser(config.username, config.password, config.schoolID);
const lectioHelper = new NodeRequest();

user.Authenticate(lectioHelper).then(async () => {
  const filepath = process.argv[2];
  const contents = fs.readFileSync(filepath, {encoding: 'base64'});
  const filename = path.basename(filepath);

  await UploadDocument(user, lectioHelper, "S31487804135_FS45421176491_", filename, contents);
    //console.log(detailedLessonInfo)
  })
  .catch((error) => {
    console.log("ERROR: " + error.message);
  });
