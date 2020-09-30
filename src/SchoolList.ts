import axios from 'axios';
import cheerio from 'react-native-cheerio';

export interface ISchool {
  name: string;
  id: string;
}

// Input: "/lectio/1266/default.aspx"
// Output: 1266
function idFromHref(href: string): string {
  return href.match('([0-9]+)')![0];
}
export async function GetAllSchools(): Promise<ISchool[]> {
  const url = 'https://www.lectio.dk/lectio/login_list.aspx?showall=1';

  const schoolListRequest = await axios.get(url).catch((err) => {
    throw err;
  });
  const $ = cheerio.load(schoolListRequest.data);

  const schools: ISchool[] = [];

  for (const el of $('#schoolsdiv div a').toArray()) {
    const name = el.firstChild.data!;
    const id = idFromHref(el.attribs['href']);
    schools.push({ name: name, id: id });
  }

  return schools;
}
