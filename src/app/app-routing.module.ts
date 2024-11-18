import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CurrencyConverterComponent } from './components/converter/components/currency-converter/currency-converter.component';
import { CurrencyDetailsComponent } from './components/details/components/currency-details/currency-details.component';

const routes: Routes = [
  { path: '', component: CurrencyConverterComponent},
  { path: 'currency-details', component: CurrencyDetailsComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
