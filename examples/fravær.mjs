import pkg, { } from '../lib/index.js';
const { AuthenticatedUser, hentFravær, NodeRequest} = pkg;
import config from './config.mjs';




const user = new AuthenticatedUser(config.username, config.password, config.schoolID);
const lectioHelper = new NodeRequest();

user.Authenticate(lectioHelper)
  .then(async () => {
        
    //let opgaveInfo = await detailedOpgaver(user, lectioHelper, '43045215959');
    let fraværrr = await hentFravær(user, lectioHelper);
    console.log(fraværrr)
  })
  .catch((error) => {
    console.log('ERROR: ' + error.message);
  });
