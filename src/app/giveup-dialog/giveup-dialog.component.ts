import { Component, OnInit } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-giveup-dialog',
  templateUrl: './giveup-dialog.component.html',
  styleUrls: ['./giveup-dialog.component.css']
})
export class GiveupDialogComponent implements OnInit
{
    // user's result of the give up dialog
    // 0: don't give up, keep going
    // 1: confirm give up
    give_up: boolean = false;

    constructor(private giveup_dialog_ref: MatDialogRef<GiveupDialogComponent>) { }
  
    ngOnInit(): void { }

    // If user presses [Give Up] button
    dialog_giveup(): void
    {
        this.give_up = true;
    }

    // When the dialog closes, pass user's choice back
    ngOnDestroy(): void
    {
        this.giveup_dialog_ref.close(this.give_up);
    }

}
