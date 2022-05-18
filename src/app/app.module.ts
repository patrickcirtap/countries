import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { GiveupDialogComponent } from './giveup-dialog/giveup-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    GiveupDialogComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule
{
}
