import { LectioRequest, LectioResponse } from '../LectioRequest';

// @ts-ignore
import cheerio from 'react-native-cheerio';
import { AuthenticatedUser } from '../Authentication';


export async function NyBesked(
    user: AuthenticatedUser,
    requestHelper: LectioRequest
) {
    // https://www.lectio.dk/lectio/165/beskeder2.aspx?type=nybesked&elevid=31487804135&selectedfolderid=-70
}
    

export async function SvarBesked(
    user: AuthenticatedUser,
    requestHelper: LectioRequest
) {

    const request1 = await requestHelper.GetLectio(
        'https://www.lectio.dk/lectio/165/beskeder2.aspx?type=&elevid=31487804135',
    );

    const request2body = {
        __LASTFOCUS: "",
        time: 0,
        __EVENTTARGET: "__Page",
        __EVENTARGUMENT: "$LB2$_MC_$_45795311588",
        __SCROLLPOSITION: "",
        __VIEWSTATEX: cheerio.load(request1.data)('#__VIEWSTATEX').toArray()[0].attribs['value'],
        __VIEWSTATEY_KEY: cheerio.load(request1.data)('#__VIEWSTATEY_KEY').toArray()[0].attribs['value'],
        __VIEWSTATE: "",
        __VIEWSTATEENCRYPTED: "",
        s$m$searchinputfield:  "",
        s$m$Content$Content$ListGridSelectionTree$folders: "-70",
        s$m$Content$Content$SPSearchText$tb: "",
        s$m$Content$Content$MarkChkDD: "-1",
    }

    const request2 = await requestHelper.PostLectio('https://www.lectio.dk/lectio/165/beskeder2.aspx?type=&elevid=31487804135', request2body);

    const request3body = {
        __LASTFOCUS: "",
        time: "0",
        __EVENTTARGET: "__Page",
        __EVENTARGUMENT: "ANSWERMESSAGE_45998827149",
        __SCROLLPOSITION: "",
        __VIEWSTATEX: cheerio.load(request2.data)('#__VIEWSTATEX').toArray()[0].attribs['value'],
        __VIEWSTATEY_KEY: "",
        __VIEWSTATE: "",
        __VIEWSTATEENCRYPTED: "",
        s$m$searchinputfield: "",
        s$m$Content$Content$ListGridSelectionTree$folders: "-70",
        s$m$Content$Content$SPSearchText$tb: "",
        LectioPostbackId: ""
    }

    const request3 = await requestHelper.PostLectio('https://www.lectio.dk/lectio/165/beskeder2.aspx?type=&elevid=31487804135', request3body);

    const request4body = {
        __LASTFOCUS: "",
        time: 0,
        __EVENTTARGET: "s$m$Content$Content$CreateAnswerOKBtn",
        __EVENTARGUMENT: "",
        __SCROLLPOSITION: "",
        __VIEWSTATEX: cheerio.load(request3.data)('#__VIEWSTATEX').toArray()[0].attribs['value'],
        __VIEWSTATEY_KEY: "",
        __VIEWSTATE: "",
        __VIEWSTATEENCRYPTED: "",
        s$m$searchinputfield: "",
        s$m$Content$Content$addRecipientToAnswerDD$inp: "",
        s$m$Content$Content$addRecipientToAnswerDD$inpid: "",
        s$m$Content$Content$Notification: "NotifyBtnAuthor",
        s$m$Content$Content$RepliesToResponseAllowed: "on",
        s$m$Content$Content$CreateAnswerHeading$tb: "Yeet",
        s$m$Content$Content$CreateAnswerDocChooser$selectedDocumentId: "",
        s$m$Content$Content$CreateAnswerContent$TbxNAME$tb: `test 2
        test med flere linjer
        [url]www.example.com[/url]
        `,
    }

    const request4 = await requestHelper.PostLectio('https://www.lectio.dk/lectio/165/beskeder2.aspx?type=&elevid=31487804135', request4body);

}
