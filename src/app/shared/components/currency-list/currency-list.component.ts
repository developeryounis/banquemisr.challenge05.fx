import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { MockedData } from 'src/app/shared/mocked-data';
import { LatestExchangeRatesResponse } from 'src/app/shared/models/latest.exchange.rates.response.model';
import { FixerService } from 'src/app/shared/services/fixer.service';

@Component({
  selector: 'app-currency-list',
  templateUrl: './currency-list.component.html',
  styleUrls: ['./currency-list.component.scss']
})
export class CurrencyListComponent implements OnInit {
  @Input() fromCurrency = new BehaviorSubject<string>('');
  @Input() toCurrency = new BehaviorSubject<string>('');
  amounts: number[] = [1, 5, 10, 50, 100, 1000];
  fromRates: string[] = [];
  toRates: string[] = [];
  mockedData = new MockedData();

  constructor(private fixerService: FixerService) {
  }
  ngOnInit(): void {
    this.fromCurrency.subscribe(x => this.setConversions());
    this.toCurrency.subscribe(x => this.setConversions());
  }

  setConversions() {
    if (!this.fromCurrency.value || !this.toCurrency.value) {
      return;
    }
    this.fixerService.getLatestExchangeRates(this.fromCurrency.value, this.toCurrency.value)
      .pipe(tap((response) => this.populateConversionList(response)))
      .subscribe();
  }

  populateConversionList(response: LatestExchangeRatesResponse) {
    this.fromRates = [];
    this.toRates = [];
    if (!response.success) {
      response = this.mockedData.getLatestExchangeRates(this.fromCurrency.value, this.toCurrency.value);
    }
    this.amounts.forEach(amount => {
      const fromToRate = response.rates[this.toCurrency.value];
      const from = `${amount} ${this.fromCurrency.value} = ${Number((amount * fromToRate).toFixed(2))} ${this.toCurrency.value}`;
      const to = `${amount} ${this.toCurrency.value} = ${Number((amount / fromToRate).toFixed(2))} ${this.fromCurrency.value}`;
      this.fromRates.push(from);
      this.toRates.push(to);
    });
  }
}
