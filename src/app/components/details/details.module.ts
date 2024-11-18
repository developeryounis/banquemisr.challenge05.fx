import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from 'src/app/shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { CurrencyDetailsComponent } from './components/currency-details/currency-details.component';
import { HistoricalDetailsComponent } from './components/historical-details/historical-details.component';



@NgModule({
  declarations: [CurrencyDetailsComponent, HistoricalDetailsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule,
    BrowserModule
  ]
})
export class DetailsModule { }
