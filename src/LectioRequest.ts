export interface LectioResponse {
    data: string;
    headers: any;
}

// Any class inheriting from this should implement the singleton pattern, to keep session data like cookies
export abstract class LectioRequest {
    abstract async GetLectio(url: string) : Promise<LectioResponse>;
    abstract async PostLectio(url: string, body: any) : Promise<LectioResponse>;

    abstract async GetCookies() : Promise<Map<string, string>>;
}