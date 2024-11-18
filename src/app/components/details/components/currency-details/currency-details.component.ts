import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, forkJoin, tap } from 'rxjs';
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

  fromCurrency = new BehaviorSubject<string>('');
  toCurrency = new BehaviorSubject<string>('');
  currencies: { [key: string]: CurrencyModel } = {};
  isLoading$ = new BehaviorSubject(true);
  historicalDataResponse: HistoricalCurrencyResponse[] = [];
  historicalData!: HistoricalDataModel;
  mockedData = new MockedData();

  constructor(private route: ActivatedRoute,
     private router: Router,
     private fixerService: FixerService,
     private currencyService: CurrencyService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.fromCurrency.next(params['from']);
      this.toCurrency.next(params['to']);
      if (!this.fromCurrency || !this.toCurrency) {
        this.router.navigate(['/']);
        return;
      }
      this.initForm();
    });
  }

  initForm() {
    this.loadCurrencies();
    this.loadHistoricalData(this.toCurrency.value);
  }

  loadHistoricalData(event: any) {
    this.toCurrency.next(event);
    const date = new Date();
    const day = `${date.getFullYear()}/${date.getMonth()}/${date.getDay()}`;
    const month =`${date.getFullYear()}/${date.getMonth() - 1}/${date.getDay()}`;
    const year = `${date.getFullYear() - 1}/${date.getMonth()}/${date.getDay()}`;
    forkJoin({
      historicalRatesDay: this.fixerService.getHistoricalData(day, this.fromCurrency.value, this.toCurrency.value),
      historicalRatesMonth: this.fixerService.getHistoricalData(month, this.fromCurrency.value, this.toCurrency.value),
      historicalRatesYear: this.fixerService.getHistoricalData(year, this.fromCurrency.value, this.toCurrency.value)
    }).pipe(tap((response) => {
      this.historicalDataResponse = [];
      this.historicalDataResponse.push(response.historicalRatesDay.success ? response.historicalRatesDay : this.mockedData.getHistoricalData(day, this.fromCurrency.value, this.toCurrency.value));
      this.historicalDataResponse.push(response.historicalRatesMonth.success ? response.historicalRatesMonth : this.mockedData.getHistoricalData(day, this.fromCurrency.value, this.toCurrency.value));
      this.historicalDataResponse.push(response.historicalRatesYear.success ? response.historicalRatesYear : this.mockedData.getHistoricalData(day, this.fromCurrency.value, this.toCurrency.value));
      this.initializeHistoricalData();
    })).subscribe();
  }

  private loadCurrencies() {
    this.currencyService.getAllCurrencies().pipe(tap((response) => {
      this.currencies = response;
      this.currencies[this.fromCurrency.value].disabled = true;
      this.isLoading$.next(false);
    })).subscribe();
  }

  

  private initializeHistoricalData() {
    this.historicalData = {
      lastDay: this.historicalDataResponse[0].rates[this.toCurrency.value],
      lastMonth: this.historicalDataResponse[1].rates[this.toCurrency.value],
      lastYear: this.historicalDataResponse[2].rates[this.toCurrency.value]
    }
  }
}
