import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MockedData } from 'src/app/shared/mocked-data';
import { CurrencyModel } from 'src/app/shared/models/currency.model';
import { HistoricalCurrencyResponse } from 'src/app/shared/models/historical.currency.response';
import { HistoricalDataModel } from 'src/app/shared/models/historical.data.model';
import { CurrencyService } from 'src/app/shared/services/currency.service';
import { FixerService } from 'src/app/shared/services/fixer.service';

@Component({
  selector: 'app-currency-details',
  templateUrl: './currency-details.component.html',
  styleUrls: ['./currency-details.component.scss']
})
export class CurrencyDetailsComponent implements OnInit {
  fromCurrency$ = new BehaviorSubject<string>('');
  toCurrency$ = new BehaviorSubject<string>('');
  currencies: { [key: string]: CurrencyModel } = {};
  isLoading$ = new BehaviorSubject<boolean>(true);
  historicalDataResponse: HistoricalCurrencyResponse[] = [];
  historicalData!: HistoricalDataModel;
  mockedData = new MockedData();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fixerService: FixerService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const fromCurrency = params['from'];
      const toCurrency = params['to'];
      if (!fromCurrency || !toCurrency) {
        this.router.navigate(['/']);
        return;
      }

      this.fromCurrency$.next(fromCurrency);
      this.toCurrency$.next(toCurrency);

      this.initialize();
    });
  }

  private initialize(): void {
    this.loadCurrencies();
    this.loadHistoricalData(this.toCurrency$.value);
  }

  private loadCurrencies(): void {
    this.currencyService
      .getAllCurrencies()
      .pipe(
        tap(response => {
          this.currencies = { ...response };
          if (this.currencies[this.fromCurrency$.value]) {
            this.currencies[this.fromCurrency$.value].disabled = true;
          }
          this.isLoading$.next(false);
        }),
        catchError(() => {
          this.isLoading$.next(false);
          return [];
        })
      )
      .subscribe();
  }

  loadHistoricalData($event: string): void {
    const historicalDates = this.getHistoricalDates();
    this.toCurrency$.next($event);
    forkJoin({
      day: this.fixerService.getHistoricalData(historicalDates.day, this.fromCurrency$.value, this.toCurrency$.value),
      month: this.fixerService.getHistoricalData(historicalDates.month, this.fromCurrency$.value, this.toCurrency$.value),
      year: this.fixerService.getHistoricalData(historicalDates.year, this.fromCurrency$.value, this.toCurrency$.value),
    })
      .pipe(
        tap(response => {
          this.historicalDataResponse = [
            this.getResponseOrMock(response.day, historicalDates.day),
            this.getResponseOrMock(response.month, historicalDates.month),
            this.getResponseOrMock(response.year, historicalDates.year),
          ];
          this.initializeHistoricalData();
        }),
        catchError(() => {
          this.historicalDataResponse = [];
          return [];
        })
      )
      .subscribe();
  }

  private getHistoricalDates(): { day: string; month: string; year: string } {
    const date = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const day = formatDate(new Date());
    const month = formatDate(new Date(new Date().setMonth(date.getMonth() - 1)));
    const year = formatDate(new Date(new Date().setFullYear(date.getFullYear() - 1)));

    return { day, month, year };
  }

  private getResponseOrMock(response: HistoricalCurrencyResponse, date: string): HistoricalCurrencyResponse {
    return response.success ? response : this.mockedData.getHistoricalData(date, this.fromCurrency$.value, this.toCurrency$.value);
  }

  private initializeHistoricalData(): void {
    this.historicalData = {
      lastDay: this.historicalDataResponse[0].rates[this.toCurrency$.value],
      lastMonth: this.historicalDataResponse[1].rates[this.toCurrency$.value],
      lastYear: this.historicalDataResponse[2].rates[this.toCurrency$.value],
    };
  }
}
