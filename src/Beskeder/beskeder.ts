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

export interface beskedTråd{
Titel?: string;
fra?: string;
til?: string[];

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
      besked.Emne = beskedTable('td:nth-child(4)').text().replace(/\t/g, '').replace(/\n/g, '');
      besked.Seneste_besked = beskedTable('td:nth-child(5)').text().replace(/\t/g, '').replace(/\n/g, '');
      besked.Foerste_besked = beskedTable('td:nth-child(6)').text().replace(/\t/g, '').replace(/\n/g, '');

      let modtagerString = beskedTable('td:nth-child(7)').html();
      besked.Modtagere = [];
      if(modtagerString !== null){
          modtagerString = modtagerString.substring(modtagerString.lastIndexOf('<span title="') + 13, modtagerString.lastIndexOf('" class="tooltip"><img src="/lectio/img/'));
          const index = (modtagerString.match(/\n/g)||[]).length+1;
          for(let k = 0; k < index; k++ ){
            let dString: string = modtagerString.substring(modtagerString.lastIndexOf('\n')+1);
            besked.Modtagere.push(dString);
            modtagerString = modtagerString.replace('\n'+dString, '')
          }
      }

      const dateString = beskedTable('td:nth-child(8)').text();
      if(dateString !== null){
        if(dateString.length === 5){
          besked.Aendret = parse(dateString, 'HH:mm', new Date());
        }
        else if(dateString.length === 8){
          if(dateString.indexOf(':')=== -1){
            besked.Aendret = parse(dateString.substring(dateString.lastIndexOf('/')-2), 'd/M', new Date());
          }
          else{
            besked.Aendret = parse(dateString.substring(dateString.lastIndexOf(':')-2), 'HH:mm', new Date().setDate(new Date().getDate()-1));
          }
        }
        else{
          besked.Aendret = parse(dateString, 'd/M-yyyy', new Date());
        }
      }
      
      let idString = beskedTable('td:nth-child(4)').children().html();
      if(idString !== null){
        idString = idString?.substring(idString.lastIndexOf('$LB2$_MC_$_')+11, idString.lastIndexOf('); return false')-1);
        besked.Id = idString.replace('&apos', '');
      }
      



      beskeder.push(besked);
      

    }
  
    beskeder.shift();
  
    return beskeder;
}