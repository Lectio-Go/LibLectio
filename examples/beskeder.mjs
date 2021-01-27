import pkg, { } from '../lib/index.js';
const { AuthenticatedUser, hentBeskedliste, NodeRequest} = pkg;
import config from './config.mjs';

const user = new AuthenticatedUser(config.username, config.password, config.schoolID);
const lectioHelper = new NodeRequest();

user.Authenticate(lectioHelper)
  .then(async () => {
        
    let liste = await hentBeskedliste(user, lectioHelper);
    console.log(liste)
  })
  .catch((error) => {
    console.log('ERROR: ' + error.message);
  });