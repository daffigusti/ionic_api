import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite';

import {TabsPage} from '../pages/tabs/tabs';
import {LoginPage} from "../pages/login-page/login-page";
import {HomePage} from "../pages/home/home";

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage: any = HomePage;

    constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
                private sqlite: SQLite) {
        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.styleDefault();
            splashScreen.hide();

            this.sqlite.create({
                name: 'data.db',
                location: 'default'
            })
                .then((db: SQLiteObject) => {

                    db.executeSql('CREATE TABLE IF NOT EXISTS people (id INTEGER PRIMARY KEY AUTOINCREMENT, firstname TEXT, lastname TEXT, image TEXT)', {})
                        .then(() => console.log('Executed SQL'))
                        .catch(e => console.log(e));

                })
                .catch(e => console.log(e));

        });
    }
}
