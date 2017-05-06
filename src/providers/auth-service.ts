import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import {Platform} from "ionic-angular";

/*
 Generated class for the AuthService provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class AuthService {
    APIUrl = 'http://localhost:81/web_service/public/api';

    constructor(public http: Http,public platform: Platform) {
        console.log('Hello AuthService Provider');

        this.APIUrl = 'http://localhost:8101/api';
        if (this.platform.is('mobileweb') == true){
            this.APIUrl = 'http://localhost:8101/api';
        }else{
            this.APIUrl = 'http://localhost:81/web_service/public/api';
        }
    }

    public login(credentials) {
        if (credentials.email === null || credentials.password === null) {
            return Observable.throw("Please insert credentials");
        } else {
            let headers = new Headers({'Content-Type': 'application/json'});
            let options = new RequestOptions({headers: headers});
            return this.http.post(this.APIUrl + "/validasi", {
                email: credentials.email
                , password: credentials.password
            }, options)
                .map((res: Response) => res.json())
                .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
        }
    }

}
