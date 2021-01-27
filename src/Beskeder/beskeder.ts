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

export async function hentBeskedliste(user: AuthenticatedUser, requestHelper: LectioRequest): Promise<Besked[]> {
    const beskeder: Besked[] = [];
  
    if (!user.isAuthenticated) await user.Authenticate(requestHelper);
  
    const url = `https://www.lectio.dk/lectio/${user.schoolId}/beskeder2.aspx?type=&elevid=${user.studentId}&selectedfolderid=-70`;

    const response = await requestHelper.GetLectio(url);
  
    
    const $ = cheerio.load(response.data);
  
    for (const k of $('#s_m_Content_Content_threadGV_ctl00 tr').toArray()) {
      const beskedTable = cheerio.load(k);
      const besked: Besked = {};

      const tempString = beskedTable('td:nth-child(3)').html();
      if(tempString !== null){
        if(tempString.substring(tempString.lastIndexOf('src="/lectio/img/') + 17, tempString.lastIndexOf('src="/lectio/img/') + 20 ) === 'mun'){
          besked.Aaben = false;
        }else{
          besked.Aaben = true;
        }
      }
      beskeder.push(besked);
    }
  
    beskeder.shift();
  
    return beskeder;
  }