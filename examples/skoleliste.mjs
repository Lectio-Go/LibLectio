import pkg from '../lib/index.js';
const { AuthenticatedUser, GetAllSchools } = pkg;
import config from './config.mjs';

GetAllSchools().then((schoolList) => {
  console.log("Found " + schoolList.length + " schools");
  console.log(schoolList);
}).catch((err) => {
  console.log("Error sending request");
  throw err;
})
