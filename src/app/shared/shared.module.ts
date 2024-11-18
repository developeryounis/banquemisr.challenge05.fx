import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { CurrencyService } from './services/currency.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FixerService } from './services/fixer.service';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
  declarations: [
    LoadingSpinnerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  exports: [
    LoadingSpinnerComponent
  ],
  providers: [CurrencyService, FixerService]
})
export class SharedModule { }
