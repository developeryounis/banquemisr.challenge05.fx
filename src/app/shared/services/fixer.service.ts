import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CurrencyConversionResponse } from '../models/currency.conversion.response.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FixerService {
  private baseUrl = 'http://data.fixer.io/api/convert';

  constructor(private http: HttpClient) {}

  /**
   * Convert currency using Fixer API.
   * @param from - Source currency code
   * @param to - Target currency code
   * @param amount - Amount to convert
   * @returns Observable<CurrencyConversionResponse> - response
   */
  convertCurrency(from: string, to: string, amount: number): Observable<CurrencyConversionResponse> {
    const params = new HttpParams()
      .set('access_key', environment.fixerAccessKey)
      .set('from', from)
      .set('to', to)
      .set('amount', amount.toString());

    return this.http.get<CurrencyConversionResponse>(this.baseUrl, { params });
  }
}
