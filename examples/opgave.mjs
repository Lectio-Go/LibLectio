import pkg, { hentOpgaver } from '../lib/index.js';
const { AuthenticatedUser, detailedOpgaver, hentFullOpgaver, NodeRequest} = pkg;
import config from './config.mjs';

const user = new AuthenticatedUser(config.username, config.password, config.schoolID);
const lectioHelper = new NodeRequest();

user.Authenticate(lectioHelper)
  .then(async () => {
        
    // let opgaveInfo = await detailedOpgaver(user, lectioHelper, '44047303516');
    let opgaver = await hentOpgaver(user, lectioHelper);
    console.log(opgaver)
  })
  .catch((error) => {
    console.log('ERROR: ' + error.message);
  });
