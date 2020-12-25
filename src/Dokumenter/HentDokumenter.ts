import { LectioRequest, LectioResponse } from '../LectioRequest';

// @ts-ignore
import cheerio from 'react-native-cheerio';

import { AuthenticatedUser } from '../Authentication';

export enum ItemType {
    Group = 'Gruppe',
    Folder = 'Mappe',
    File = 'Fil',
}

export interface Item {
    id?: string;
    parentId?: string;
    children?: string[];
    type?: ItemType;
    groupId?: string;
    name?: string; 
}
export async function UploadDocument(user: AuthenticatedUser, requestHelper: LectioRequest, folderId: string, filename: string, data: string) {
    let request1 = await requestHelper.GetLectio("https://www.lectio.dk/lectio/165/dokumentrediger.aspx?folderid="+folderId);

    let request2 = await requestHelper.UploadLectio("https://www.lectio.dk/lectio/165/dokumentupload.aspx", filename, data);

    let $ = cheerio.load(request1.data);

    let request3_body = { "time": 0,
        "__EVENTTARGET": "m$Content$docChooser",
        "__EVENTARGUMENT": "documentId",
        "__SCROLLPOSITION": "",
        "__VIEWSTATEX": $('#__VIEWSTATEX').toArray()[0].attribs['value'],
        "__VIEWSTATEY_KEY": "",
        "__VIEWSTATE": "",
        "__VIEWSTATEENCRYPTED": "",
        "__EVENTVALIDATION": $('#__EVENTVALIDATION').toArray()[0].attribs['value'],
        "m$searchinputfield": "",
        "m$Content$docChooser$selectedDocumentId": request2.data,
        "m$Content$EditDocComments$tb": "",
        "m$Content$AffiliationsGV$ctl02$FolderBox$ctl03": folderId,
        "m$Content$EditDocRelatedAddDD$inp": "",
        "m$Content$EditDocRelatedAddDD$inpid": "",
        "LectioPostbackId": "",
    }

    let request3 = await requestHelper.PostLectio("https://www.lectio.dk/lectio/165/dokumentrediger.aspx?folderid="+folderId, request3_body);

    $ = cheerio.load(request3.data);

    let request4_body = { "time": 0,
        "__EVENTTARGET": "m$Content$SaveButtonsRow$abtn",
        "__EVENTARGUMENT": "",
        "__SCROLLPOSITION": "",
        "__VIEWSTATEX": $('#__VIEWSTATEX').toArray()[0].attribs['value'],
        "__VIEWSTATEY_KEY": "",
        "__VIEWSTATE": "",
        "__VIEWSTATEENCRYPTED": "",
        "__EVENTVALIDATION": $('#__EVENTVALIDATION').toArray()[0].attribs['value'],
        "m$searchinputfield": "",
        "m$Content$docChooser$selectedDocumentId": request2.data,
        "m$Content$EditDocComments$tb": "",
        "m$Content$AffiliationsGV$ctl02$FolderBox$ctl03": folderId,
        "m$Content$EditDocRelatedAddDD$inp": "",
        "m$Content$EditDocRelatedAddDD$inpid": "",
        "LectioPostbackId": "",
    }

    let request4 = await requestHelper.PostLectio("https://www.lectio.dk/lectio/165/dokumentrediger.aspx?folderid="+folderId, request4_body);

    console.log(request4.data);
    console.log(request2.data);
}
