import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, tap } from 'rxjs';
import { CurrencyConversionResponse } from 'src/app/shared/models/currency.conversion.response.model';
import { CurrencyConverterModel } from 'src/app/shared/models/currency.converter.model';
import { CurrencyModel } from 'src/app/shared/models/currency.model';
import { CurrencyService } from 'src/app/shared/services/currency.service';
import { FixerService } from 'src/app/shared/services/fixer.service';

@Component({
  selector: 'app-currency-converter',
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.scss']
})
export class CurrencyConverterComponent implements OnInit {
  converterForm!: FormGroup;
  isLoading$ = new BehaviorSubject(true);
  currencyConversionResponse = new BehaviorSubject<CurrencyConversionResponse>({} as CurrencyConversionResponse);
  fromCurrencies: CurrencyModel[] = [];
  toCurrencies: CurrencyModel[] = [];
  convertedAmount: string = '';
  errorMessage: string = '';
  canConvert: boolean = false;

  constructor(private fb: FormBuilder,
     private currencyService: CurrencyService,
     private fixerService: FixerService) { }

  ngOnInit(): void {
    this.currencyService.getAllCurrencies()
        .pipe(tap((currencies: CurrencyModel[]) => this.buildForm(currencies.map(x => x))))
        .subscribe();
  }

  swapCurrencies(): void {
    const fromCurrency = this.converterForm.value.fromCurrency;
    const toCurrency = this.converterForm.value.toCurrency;

    this.converterForm.patchValue({
      fromCurrency: toCurrency,
      toCurrency: fromCurrency
    });
  }

  convertCurrency(): void {
    const currencyConverterModel = this.converterForm.value as CurrencyConverterModel;
    if (this.converterForm.valid) {
      this.fixerService.convertCurrency(currencyConverterModel.from, currencyConverterModel.to, currencyConverterModel.amount)
          .pipe(tap((response: CurrencyConversionResponse) => {
            if (response.success) {
              this.errorMessage = '';
              this.convertedAmount = String(response.result)
            } else {
              this.errorMessage = response.error.info;
              this.convertedAmount = '';
            }
          }))
          .subscribe();
    }
  }

  private buildForm(currencies: CurrencyModel[]): void {
    this.converterForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]],
      fromCurrency: ['', Validators.required],
      toCurrency: ['', Validators.required],
    });
    this.initializeCurrencyLists(currencies);
    this.setupValueChangeHandlers();
    this.isLoading$.next(false);
  }

  private initializeCurrencyLists(currencies: CurrencyModel[]): void {
    this.fromCurrencies =  currencies.map(currency => ({ ...currency }));
    this.toCurrencies =  currencies.map(currency => ({ ...currency }));
  }
  
  private setupValueChangeHandlers(): void {
    this.converterForm.get('amount')?.valueChanges.subscribe(value => {
      this.canConvert = value > 0;
    });
  
    this.converterForm.get('fromCurrency')?.valueChanges.subscribe(value => {
      this.toggleCurrencyDisabled(this.toCurrencies, value);
    });
  
    this.converterForm.get('toCurrency')?.valueChanges.subscribe(value => {
      this.toggleCurrencyDisabled(this.fromCurrencies, value);
    });
  }

  private toggleCurrencyDisabled(currencyList: CurrencyModel[], selectedValue: string): void {
    currencyList.forEach(currency => {
      currency.disabled = currency.code === selectedValue;
    });
  }
  
}
