import pkg, { hentOpgaver } from '../lib/index.js';
const { AuthenticatedUser, SvarBesked, hentFullOpgaver, NodeRequest} = pkg;
import config from './config.mjs';

const user = new AuthenticatedUser(config.username, config.password, config.schoolID);
const lectioHelper = new NodeRequest();

user.Authenticate(lectioHelper)
  .then(async () => {
      // Hent beskedside
      const request1 = await SvarBesked(user, lectioHelper);
  })
  .catch((error) => {
    console.log('ERROR: ' + error.message);
  });
