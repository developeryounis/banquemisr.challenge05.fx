import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, forkJoin, Subscription } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MockedData } from 'src/app/shared/mocked-data';
import { CurrencyModel } from 'src/app/shared/models/currency.model';
import { HistoricalCurrencyResponse } from 'src/app/shared/models/historical.currency.reposnse';
import { HistoricalDataModel } from 'src/app/shared/models/historical.data.model';
import { CurrencyService } from 'src/app/shared/services/currency.service';
import { FixerService } from 'src/app/shared/services/fixer.service';

@Component({
  selector: 'app-currency-details',
  templateUrl: './currency-details.component.html',
  styleUrls: ['./currency-details.component.scss']
})
export class CurrencyDetailsComponent implements OnInit, OnDestroy {
  fromCurrency$ = new BehaviorSubject<string>('');
  toCurrency$ = new BehaviorSubject<string>('');
  currencies: { [key: string]: CurrencyModel } = {};
  isLoading$ = new BehaviorSubject<boolean>(true);
  historicalDataResponse: HistoricalCurrencyResponse[] = [];
  historicalData!: HistoricalDataModel;
  mockedData = new MockedData();
  subscription = new Subscription();

  constructor(
    readonly route: ActivatedRoute,
    readonly router: Router,
    private fixerService: FixerService,
    private currencyService: CurrencyService
  ) {}
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription.add(this.route.queryParams.subscribe(params => {
      const fromCurrency = params['from'];
      const toCurrency = params['to'];
      if (!fromCurrency || !toCurrency) {
        this.router.navigate(['/']);
        return;
      }

      this.fromCurrency$.next(fromCurrency);
      this.toCurrency$.next(toCurrency);

      this.initialize();
    }));
  }

  initialize(): void {
    this.loadCurrencies();
    this.loadHistoricalData(this.toCurrency$.value);
  }

  loadCurrencies(): void {
    this.subscription.add(this.currencyService
      .getAllCurrencies()
      .pipe(
        tap(response => {
          this.currencies = { ...response };
          if (this.currencies[this.fromCurrency$.value]) {
            this.currencies[this.fromCurrency$.value].disabled = true;
          }
          this.isLoading$.next(false);
        })
      )
      .subscribe());
  }

  loadHistoricalData($event: string): void {
    const historicalDates = this.getHistoricalDates();
    this.toCurrency$.next($event);
    this.subscription.add(forkJoin({
      day: this.fixerService.getHistoricalData(historicalDates.day, this.fromCurrency$.value, this.toCurrency$.value),
      month: this.fixerService.getHistoricalData(historicalDates.month, this.fromCurrency$.value, this.toCurrency$.value),
      year: this.fixerService.getHistoricalData(historicalDates.year, this.fromCurrency$.value, this.toCurrency$.value),
    })
      .pipe(
        tap(response => this.handleResponseOrError(response)),
        catchError((error) => this.handleResponseOrError(error))
      )
      .subscribe());
  }

  getHistoricalDates(): { day: string; month: string; year: string } {
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

  private handleResponseOrError(response: any): any {
    console.log(response);
    const historicalDates = this.getHistoricalDates();
    this.historicalDataResponse = [
      this.getResponseOrMock(response?.day, historicalDates.day),
      this.getResponseOrMock(response?.month, historicalDates.month),
      this.getResponseOrMock(response?.year, historicalDates.year),
    ];
    this.initializeHistoricalData();
  }

  private initializeHistoricalData(): void {
    this.historicalData = {
      lastDay: this.historicalDataResponse[0].rates[this.toCurrency$.value],
      lastMonth: this.historicalDataResponse[1].rates[this.toCurrency$.value],
      lastYear: this.historicalDataResponse[2].rates[this.toCurrency$.value],
    };
  }
}
