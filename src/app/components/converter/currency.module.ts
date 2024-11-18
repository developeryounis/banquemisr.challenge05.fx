import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyConverterComponent } from './components/currency-converter/currency-converter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CurrencyListComponent } from './components/currency-list/currency-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';



@NgModule({
  declarations: [
    CurrencyConverterComponent,
    CurrencyListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule,
    BrowserModule
  ]
})
export class CurrencyModule { }
