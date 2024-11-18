import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { MockedData } from 'src/app/shared/mocked-data';
import { CurrencyConversionResponse } from 'src/app/shared/models/currency.conversion.response.model';
import { CurrencyConverterModel } from 'src/app/shared/models/currency.converter.model';
import { CurrencyModel } from 'src/app/shared/models/currency.model';
import { LatestExchangeRatesResponse } from 'src/app/shared/models/latest.exchange.rates.response.model';
import { CurrencyService } from 'src/app/shared/services/currency.service';
import { FixerService } from 'src/app/shared/services/fixer.service';

const FORM_KEYS = {
  AMOUNT: 'amount',
  FROM_CURRENCY: 'fromCurrency',
  TO_CURRENCY: 'toCurrency',
}
@Component({
  selector: 'app-currency-converter',
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.scss']
})
export class CurrencyConverterComponent implements OnInit {
  converterForm!: FormGroup;
  isLoading$ = new BehaviorSubject(true);
  currencyConversionResponse = new BehaviorSubject<CurrencyConversionResponse>({} as CurrencyConversionResponse);
  fromCurrencies: { [key: string]: CurrencyModel } = {};
  toCurrencies: { [key: string]: CurrencyModel } = {};
  currencies: { [key: string]: CurrencyModel } = {};
  convertedAmount: string = '';
  canConvert: boolean = false;
  fromRates!: LatestExchangeRatesResponse;
  toRates!: LatestExchangeRatesResponse;
  fromCurrency = new BehaviorSubject<string>('');
  toCurrency = new BehaviorSubject<string>('');
  mockedData = new MockedData();

  constructor(private fb: FormBuilder,
    private currencyService: CurrencyService,
    private fixerService: FixerService,
    private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.fromCurrency.next(params['from']);
      this.toCurrency.next(params['to']);
    });
  }

  ngOnInit(): void {
    this.currencyService.getAllCurrencies()
      .pipe(tap((currencies) => {
        this.buildForm(currencies);
      }))
      .subscribe();
  }

  swapCurrencies(): void {
    const fromCurrency = this.converterForm.value.fromCurrency;
    const toCurrency = this.converterForm.value.toCurrency;

    this.converterForm.patchValue({
      [FORM_KEYS.FROM_CURRENCY]: toCurrency,
      [FORM_KEYS.TO_CURRENCY]: fromCurrency
    });
  }

  convertCurrency(): void {
    const currencyConverterModel = this.converterForm.value as CurrencyConverterModel;
    if (this.converterForm.valid) {
      this.fixerService.convertCurrency(currencyConverterModel.fromCurrency, currencyConverterModel.toCurrency, currencyConverterModel.amount)
        .pipe(tap((response) => {
          if (!response.success) {
            response = this.mockedData.getConversion(currencyConverterModel.fromCurrency, currencyConverterModel.toCurrency, currencyConverterModel.amount);
          }
          this.convertedAmount = String(response?.result);
        }))
        .subscribe();
    }
  }

  buildForm(currencies: { [key: string]: CurrencyModel }): void {
    this.converterForm = this.fb.group({
      [FORM_KEYS.AMOUNT]: [null, [Validators.required, Validators.min(1)]],
      [FORM_KEYS.FROM_CURRENCY]: ['', Validators.required],
      [FORM_KEYS.TO_CURRENCY]: ['', Validators.required],
    });
    this.initializeCurrencyLists(currencies);
    this.setupValueChangeHandlers();
    this.converterForm.patchValue({
      [FORM_KEYS.FROM_CURRENCY]: this.fromCurrency.value,
      [FORM_KEYS.TO_CURRENCY]: this.toCurrency.value
    })
    this.isLoading$.next(false);
  }

  private initializeCurrencyLists(currencies: { [key: string]: CurrencyModel }): void {
    this.currencies = structuredClone(currencies);
    this.fromCurrencies = structuredClone(currencies);
    this.toCurrencies = structuredClone(currencies);
  }

  private setupValueChangeHandlers(): void {
    this.converterForm.get(FORM_KEYS.AMOUNT)?.valueChanges.subscribe(value => {
      this.canConvert = value > 0;
    });

    this.converterForm.get(FORM_KEYS.FROM_CURRENCY)?.valueChanges.subscribe(value => {
      this.toggleCurrencyDisabled(this.toCurrencies, value);
      this.fromCurrency.next(value);
    });

    this.converterForm.get(FORM_KEYS.TO_CURRENCY)?.valueChanges.subscribe(value => {
      this.toggleCurrencyDisabled(this.fromCurrencies, value);
      this.toCurrency.next(value);
    });
  }

  private toggleCurrencyDisabled(currencyList: { [key: string]: CurrencyModel }, selectedValue: string): void {
    if (!selectedValue) {
      return;
    }
    Object.keys(currencyList).forEach(key => {
      currencyList[key].disabled = false;
    });
    if (currencyList[selectedValue]) {
      currencyList[selectedValue].disabled = true;
    }
  }

}
