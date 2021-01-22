// @ts-ignore
import cheerio from 'react-native-cheerio';
import { parse } from 'date-fns';

import { LectioRequest, LectioResponse } from '../LectioRequest';
import { AuthenticatedUser } from '../Authentication';

export interface Besked{

    Aaben?: boolean;
    Emne?: string;
    Seneste_besked?: string;
    Foerste_besked?: string;
    Modtagere?: string[];
    Aendret?: Date;
    Id?: string;

}

export async function Beskedliste(user: AuthenticatedUser, requestHelper: LectioRequest): Promise<Besked[]> {
    const opgaver: Besked[] = [];
  
    if (!user.isAuthenticated) await user.Authenticate(requestHelper);
  
    const url = `https://www.lectio.dk/lectio/${user.schoolId}/beskeder2.aspx?type=&elevid=${user.studentId}&selectedfolderid=-70`;

    const response = await requestHelper.GetLectio(url);
  
    // ________________________________________________________________________________________________
    const $ = cheerio.load(response.data);
  
    for (const k of $('#printStudentAssignmentsArea tr').toArray()) {
      const whoKnows = cheerio.load(k);
      const opgave: Opgave = {};
      opgave.uge = whoKnows('td:nth-child(1) span').attr('title');
      opgave.hold = whoKnows('td:nth-child(2) span').text();
      opgave.opgavetitel = whoKnows('td:nth-child(3) span').text();
  
      const yeet = whoKnows('td:nth-child(3) span').html();
      if (yeet !== null) {
        opgave.id = yeet.substring(yeet.lastIndexOf('exerciseid=') + 11, yeet.lastIndexOf('&amp;prevurl'));
      }
      opgave.frist = parse(whoKnows('td:nth-child(4)').text(), 'd/M-yyyy HH:mm', new Date()).toString();
      opgave.elevtid = whoKnows('td:nth-child(5)').text();
      opgave.status = whoKnows('td:nth-child(6)').text();
      opgave.fravaer = whoKnows('td:nth-child(7)').text();
      opgave.afventer = whoKnows('td:nth-child(8)').text();
      opgave.opgavenote = whoKnows('td:nth-child(9)').text();
      opgave.karater = whoKnows('td:nth-child(10)').text();
      opgave.elevnote = whoKnows('td:nth-child(11)').text();
      opgaver.push(opgave);
    }
  
    opgaver.shift();
  
    return opgaver;
  }