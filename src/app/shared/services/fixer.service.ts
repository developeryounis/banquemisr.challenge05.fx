import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { CurrencyConversionResponse } from '../models/currency.conversion.response.model';
import { environment } from 'src/environments/environment';
import { LatestExchangeRatesResponse } from '../models/latest.exchange.rates.response.model';
import { HistoricalCurrencyResponse } from '../models/historical.currency.response';

@Injectable({
  providedIn: 'root'
})
export class FixerService {
  private baseUrl = 'http://data.fixer.io/api';

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

    return this.http.get<CurrencyConversionResponse>(`${this.baseUrl}/convert`, { params });
  }

  /**
   * Get the latest exchange rates for a given base currency and list of symbols.
   * @param baseCurrency - The base currency (e.g., USD).
   * @param symbols - A comma-separated list of target currencies (e.g., 'GBP,JPY,EUR').
   */
  getLatestExchangeRates(baseCurrency: string, symbols: string): Observable<LatestExchangeRatesResponse> {
    const params = new HttpParams()
      .set('access_key', environment.fixerAccessKey)
      .set('base', baseCurrency)
      .set('symbols', symbols);

    return this.http.get<LatestExchangeRatesResponse>(`${this.baseUrl}/latest`, { params });
  }

  /**
   * Get the history exchange rates for a given base currency and list of symbols.
   * @param date history date string YYYY-MM-DD
   * @param baseCurrency - The base currency (e.g., USD).
   * @param symbols - A comma-separated list of target currencies (e.g., 'GBP,JPY,EUR').
   * @returns 
   */
  getHistoricalData(date: string, baseCurrency: string, symbols: string): Observable<HistoricalCurrencyResponse> {
    const params = new HttpParams()
      .set('access_key', environment.fixerAccessKey)
      .set('base', baseCurrency)
      .set('symbols', symbols);

    return this.http.get<HistoricalCurrencyResponse>(`${this.baseUrl}${date}`, { params });
  }
}
