import { Component, Input } from '@angular/core';
import { LatestExchangeRatesResponse } from '../../models/latest.exchange.rates.response.model';

@Component({
  selector: 'app-currency-list',
  templateUrl: './currency-list.component.html',
  styleUrls: ['./currency-list.component.scss']
})
export class CurrencyListComponent {
  @Input() fromRates!: LatestExchangeRatesResponse;
  @Input() toRates!: LatestExchangeRatesResponse;

  printConversion(index: number, baseCurrency: string, rate: number, toCurrency: string) {
    if (!index) {
      return `1 ${baseCurrency} = ${rate * 1} ${toCurrency}`;
    }

    const amount = index * 5;
    const result = `${amount} ${baseCurrency} = ${rate * amount} ${toCurrency}`;
    return result;
  }
}
