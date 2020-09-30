import dotenv from 'dotenv';
import fs from 'fs';

if (fs.existsSync('.env')) {
  console.log('Using .env file to supply config environment variables');
  dotenv.config({ path: '.env' });
} else {
  console.log('FATAL: Please create a .env file with your lectio credentials to run this program');
  process.exit(1);
}

export default {
  /* tslint:disable:no-string-literal */
  username: String(process.env['LOGINNAME']),
  password: String(process.env['PASSWORD']),
  schoolID: String(process.env['SCHOOLID']),
  /* tslint:enable:no-string-literal */
};
