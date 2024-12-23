import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, Subscription, tap } from 'rxjs';
import { MockedData } from 'src/app/shared/mocked-data';
import { FixerService } from 'src/app/shared/services/fixer.service';

@Component({
  selector: 'app-currency-list',
  templateUrl: './currency-list.component.html',
  styleUrls: ['./currency-list.component.scss']
})
export class CurrencyListComponent implements OnInit, OnDestroy {
  @Input() fromCurrency = new BehaviorSubject<string>('');
  @Input() toCurrency = new BehaviorSubject<string>('');
  amounts: number[] = [1, 5, 10, 50, 100, 1000];
  fromRates: string[] = [];
  toRates: string[] = [];
  mockedData = new MockedData();
  subscription = new Subscription();

  constructor(private fixerService: FixerService) {
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  ngOnInit(): void {
    this.subscription.add(this.fromCurrency.subscribe(x => this.setConversions()));
    this.subscription.add(this.toCurrency.subscribe(x => this.setConversions()));
  }

  setConversions() {
    if (!this.fromCurrency.value || !this.toCurrency.value) {
      return;
    }
    this.subscription.add(this.fixerService.getLatestExchangeRates(this.fromCurrency.value, this.toCurrency.value)
      .pipe(tap((response) => this.handleResponseOrError(response)),
        catchError((error) => this.handleResponseOrError(error)))
      .subscribe());
  }

  handleResponseOrError(response: any): any {
    this.fromRates = [];
    this.toRates = [];
    if (!response.success) {
      response = this.mockedData.getLatestExchangeRates(this.fromCurrency.value, this.toCurrency.value);
    }
    this.amounts.forEach(amount => {
      const fromToRate = response.rates[this.toCurrency.value];
      const from = this.formatConversion(amount, amount * fromToRate, this.fromCurrency.value, this.toCurrency.value)
      const to = this.formatConversion(amount, amount / fromToRate, this.fromCurrency.value, this.toCurrency.value)
      this.fromRates.push(from);
      this.toRates.push(to);
    });
  }

  formatConversion(amount: number, result: number, fromCurrency: string, toCurrency: string): string {
    return `${amount} ${fromCurrency} = ${Number(result.toFixed(2))} ${toCurrency}`;
  }
}
