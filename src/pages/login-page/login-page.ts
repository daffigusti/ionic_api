import { Component } from '@angular/core';
import {AlertController, IonicPage, Loading, LoadingController, NavController, NavParams} from 'ionic-angular';
import {AuthService} from "../../providers/auth-service";
import {HomePage} from "../home/home";

/**
 * Generated class for the LoginPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-login-page',
  templateUrl: 'login-page.html',
})
export class LoginPage {
  loading: Loading;
  registerCredentials = { email: '', password: '' };
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private auth: AuthService,
              private alertCtrl: AlertController,
              private loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
      dismissOnPageChange: true
    });
    this.loading.present();
  }

  login(){
    this.showLoading();
    console.log(this.registerCredentials);
    this.auth.login(this.registerCredentials).subscribe(allowed => {
          console.log(allowed);
          if (allowed.error == false) {

            //this.showMessage("Login Sukses");
            setTimeout(() => {

              this.loading.dismiss();
              // this.getUserInfo();
              this.navCtrl.setRoot(HomePage)
            });
          } else {
            this.showError(allowed.message);
          }
        },
        error => {
          console.log(error);
          this.showError(error);
        });
  }
  showError(text) {
    this.loading.dismiss();

    let alert = this.alertCtrl.create({
      title: 'Fail',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present(prompt);
  }

  showMessage(text) {
    setTimeout(() => {
      this.loading.dismiss();
    });

    let alert = this.alertCtrl.create({
      title: 'Sukses',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present(prompt);
  }
}
