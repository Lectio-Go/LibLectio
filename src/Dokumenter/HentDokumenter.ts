import { LectioRequest, LectioResponse } from '../LectioRequest';

// @ts-ignore
import cheerio from 'react-native-cheerio';

import { AuthenticatedUser } from '../Authentication';

enum ItemType {
    Group = 'Gruppe',
    Folder = 'Mappe',
    File = 'Fil',
}

interface Item {
    id?: string;
    parentId?: string;
    children?: string[];
    type?: ItemType;
    groupId?: string;
    name?: string; 
}


// async function UploadDocument(user: AuthenticatedUser, requestHelper: LectioRequest, folderId: string): Promise<Item> {

// }