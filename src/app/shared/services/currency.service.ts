import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { CurrencyModel } from '../models/currency.model';
import { MockedData } from '../mocked-data';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  mockedData = new MockedData();
  getAllCurrencies(): Observable<{ [key: string]: CurrencyModel }>  {
    return of(this.mockedData.getCurrencies()).pipe(delay(1000));
  }

  
}
