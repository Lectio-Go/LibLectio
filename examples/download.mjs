import pkg, { UploadDocument } from '../lib/index.js';
const { AuthenticatedUser, GetBriefTimetable, GetDetailedLessonInfo, NodeRequest} = pkg;
import config, {image} from './config.mjs';
import fs from 'fs'

const user = new AuthenticatedUser(config.username, config.password, config.schoolID);
const lectioHelper = new NodeRequest();

user.Authenticate(lectioHelper).then(async () => {
    let file = await lectioHelper.DownloadLectio("https://www.lectio.dk/lectio/165/dokumenthent.aspx?documentid=39599701261")
    fs.writeFile(
        "test.docx",
        Buffer.from(file.data, "base64"),
        (err) => {}
      );
    console.log((await file).data)
})
