import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { CurrencyModel } from '../models/currency.model';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  getAllCurrencies(): Observable<CurrencyModel[]>  {
    return of([
      {
        code: "USD",
        name: "United States Dollar"
      },
      {
        code: "EUR",
        name: "Euro"
      },
      {
        code: "GBP",
        name: "British Pound Sterling"
      },
      {
        code: "CHF",
        name: "Swiss Franc"
      },
      {
        code: "SAR",
        name: "Saudi Riyal"
      },
      {
        code: "KWD",
        name: "Kuwaiti Dinar"
      },
      {
        code: "EGP",
        name: "Egyptian Pound"
      }
    ]).pipe(delay(2000))
  }

  
}
