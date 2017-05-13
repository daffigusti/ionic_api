import {Component} from '@angular/core';

import {
    NavController,
    ActionSheetController,
    ToastController,
    Platform,
    LoadingController,
    Loading, AlertController
} from 'ionic-angular';

import {File} from '@ionic-native/file';
import {Transfer, TransferObject} from '@ionic-native/transfer';
import {FilePath} from '@ionic-native/file-path';
import {Camera} from '@ionic-native/camera';
import {NativeStorage} from "@ionic-native/native-storage";
import {Network} from "@ionic-native/network";
import {SQLite, SQLiteObject} from '@ionic-native/sqlite';

declare var cordova: any;

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    lastImage: string = null;
    loading: Loading;
    data: any;
    db: any;
    public database: SQLiteObject;
    people = {firstname: '', lastname: '', image: ''};
    public row_data: any;

    constructor(public navCtrl: NavController,
                private camera: Camera,
                private transfer: Transfer,
                private file: File,
                private filePath: FilePath,
                public actionSheetCtrl: ActionSheetController,
                public toastCtrl: ToastController,
                public platform: Platform,
                public loadingCtrl: LoadingController,
                private nativeStorage: NativeStorage,
                private network: Network,
                private sqlite: SQLite,
                public alertCtrl: AlertController,) {

        this.row_data = [];

        this.sqlite.create({
            name: 'data.db',
            location: 'default'
        })
            .then((db: SQLiteObject) => {
                this.database = db;

                this.retrieve();
            })
            .catch(e => console.log(e));
    }

    ionViewDidLoad() {

    }

    showAlert(title, message) {
        var alert = this.alertCtrl.create({
            title: title,
            subTitle: message,
            buttons: ['OK']
        });
        alert.present();
    }

    public add() {
        var page = this;
        var sql = "INSERT INTO people (firstname, lastname, image) VALUES (" + this.people.firstname + "," + this.people.lastname + "," + this.lastImage + ")";
        console.log(sql);
        this.database.executeSql("INSERT INTO people (firstname, lastname, image) VALUES ('" + this.people.firstname + "','" + this.people.lastname + "','" + this.lastImage + "')", []).then((data) => {
            console.log("INSERTED: " + JSON.stringify(data));
            this.showAlert("Sukses", "Data sudah ditambahkan");
            this.people.firstname = '';
            this.people.lastname = '';
            this.lastImage = null;
            page.retrieve();
        }, (error) => {
            console.log(error);
            console.log("ERROR: " + JSON.stringify(error.err));
        });
    }

    public clear() {
        var page = this;
        this.database.transaction(function (tx) {
            tx.executeSql('DELETE FROM people', [], function (tx, rs) {
                console.log('Data is deleted ');
                page.retrieve();
            }, function (tx, error) {
                console.log('SELECT error: ' + error.message);
            });
        });
    }

    public retrieve() {
        var page = this;
        this.database.transaction(function (tx) {
            tx.executeSql('SELECT * FROM people', [], function (tx, rs) {
                //console.log('Record count ' + rs.rows.item(0).firstname);
                console.log("Data: " + JSON.stringify(rs.rows.item));
                for (var x = 0; x < rs.rows.length; x++) {
                    page.row_data.push(
                        {
                            firstname: rs.rows.item(x).firstname,
                            lastname: rs.rows.item(x).lastname,
                            image: rs.rows.item(x).image,
                        }
                    );
                }
            }, function (tx, error) {
                console.log('SELECT error: ' + error.message);
            });
        });
    }

    public presentActionSheet() {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Select Image Source',
            buttons: [
                {
                    text: 'Load from Library',
                    handler: () => {
                        this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
                    }
                },
                {
                    text: 'Use Camera',
                    handler: () => {
                        this.takePicture(this.camera.PictureSourceType.CAMERA);
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel'
                }
            ]
        });
        actionSheet.present();
    }

    public takePicture(sourceType) {
        // Create options for the Camera Dialog
        var options = {
            quality: 50,
            sourceType: sourceType,
            saveToPhotoAlbum: false,
            correctOrientation: true,
            encodingType: 0
        };

        // Get the data of an image
        this.camera.getPicture(options).then((imagePath) => {
            // Special handling for Android library
            if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
                this.filePath.resolveNativePath(imagePath)
                    .then(filePath => {
                        let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
                        let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
                        this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
                    });
            } else {
                var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
                var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
                this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
            }
        }, (err) => {
            this.presentToast('Error while selecting image.');
        });
    }

    // Create a new name for the image
    private createFileName() {
        var d = new Date(),
            n = d.getTime(),
            newFileName = n + ".jpg";
        return newFileName;
    }

// Copy the image to a local folder
    private copyFileToLocalDir(namePath, currentName, newFileName) {
        this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
            this.lastImage = newFileName;


            var dat_i = {image: this.lastImage, text: 'halo', is_upload: false};
            this.data.push(dat_i)
        }, error => {
            this.presentToast('Error while storing file.');
        });
    }

    private presentToast(text) {
        let toast = this.toastCtrl.create({
            message: text,
            duration: 3000,
            position: 'top'
        });
        toast.present();
    }

// Always get the accurate path to your apps folder
    public pathForImage(img) {
        if (img === null) {
            return '';
        } else {
            return cordova.file.dataDirectory + img;
        }
    }

    public uploadImage() {
        // Destination URL
        var url = "http://192.168.1.6:81/web_service/public/api/upload_image";

        // File for Upload
        var targetPath = this.pathForImage(this.lastImage);

        // File name only
        var filename = this.lastImage;

        var options = {
            fileKey: "file",
            fileName: filename,
            chunkedMode: false,
            mimeType: "multipart/form-data",
            params: {'fileName': filename}
        };

        const fileTransfer: TransferObject = this.transfer.create();

        this.loading = this.loadingCtrl.create({
            content: 'Uploading...',
        });
        this.loading.present();

        // Use the FileTransfer to upload the image
        fileTransfer.upload(targetPath, url, options).then(data => {
            this.loading.dismissAll()
            this.presentToast('Image succesful uploaded.');

            this.nativeStorage.setItem("IS_UPLOAD", false);

        }, err => {
            this.loading.dismissAll()
            this.presentToast('Error while uploading file.');
        });
    }

    public try_upload() {
        // watch network for a connection
        let connectSubscription = this.network.onConnect().subscribe(() => {
            console.log('network connected!');
            // We just got a connection but we need to wait briefly
            // before we determine the connection type.  Might need to wait 
            // prior to doing any api requests as well.
            setTimeout(() => {
                if (this.network.type === 'wifi') {
                    console.log('we got a wifi connection, woohoo!');
                }
            }, 3000);
        });
    }


}
