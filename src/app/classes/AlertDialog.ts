import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
    selector: 'alert-dialog',
    template: `<h4>{{data.text}}</h4>`,
})
export class AlertDialog {
    constructor(
        public dialogRef: MatDialogRef<AlertDialog>,
        @Inject(MAT_DIALOG_DATA) public data: TextDialogData) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

}

export interface TextDialogData {
    text: string;
}
