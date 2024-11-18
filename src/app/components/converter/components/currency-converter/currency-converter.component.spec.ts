import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrencyConverterComponent } from './currency-converter.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TestModule } from 'src/app/shared/test.module';
import { CurrencyService } from 'src/app/shared/services/currency.service';
import { FixerService } from 'src/app/shared/services/fixer.service';
import { of } from 'rxjs';
import { CurrencyModel } from 'src/app/shared/models/currency.model';
import { CurrencyConversionResponse } from 'src/app/shared/models/currency.conversion.response.model';

describe('CurrencyConverterComponent', () => {
  let component: CurrencyConverterComponent;
  let fixture: ComponentFixture<CurrencyConverterComponent>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let fixerService: jasmine.SpyObj<FixerService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CurrencyConverterComponent],
      imports: [TestModule, SharedModule]
    });
    fixture = TestBed.createComponent(CurrencyConverterComponent);
    component = fixture.componentInstance;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    fixerService = TestBed.inject(FixerService) as jasmine.SpyObj<FixerService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and build form with currencies', () => {
    const mockCurrencies: { [key: string]: CurrencyModel } = { USD: { name: 'United States Dollar' }, EUR: { name: 'Euro' } } 
    const getAllCurrenciesSpy = spyOn(currencyService, 'getAllCurrencies');

    currencyService.getAllCurrencies.and.returnValue(of(mockCurrencies));

    component.ngOnInit();

    expect(getAllCurrenciesSpy).toHaveBeenCalled();
  });

  it('should swap currencies', () => {
    component.buildForm({});
    component.converterForm.setValue({
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      amount: 100
    });

    component.swapCurrencies();

    expect(component.converterForm.value.fromCurrency).toBe('EUR');
    expect(component.converterForm.value.toCurrency).toBe('USD');
  });

  it('should convert currency and set converted amount', () => {
    component.buildForm({});
    const mockResponse = { success: false, result: 85 } as CurrencyConversionResponse;
    const getConversionSpy = spyOn(component.mockedData, 'getConversion');
    const convertCurrencySpy = spyOn(fixerService, 'convertCurrency');
    fixerService.convertCurrency.and.returnValue(of(mockResponse));

    component.converterForm.setValue({
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      amount: 100
    });

    component.convertCurrency();

    expect(convertCurrencySpy).toHaveBeenCalledWith('USD', 'EUR', 100);
    expect(getConversionSpy).toHaveBeenCalled();
  });

  it('should use mocked data if conversion response is not successful', () => {
    component.buildForm({});
    const mockResponse = { success: false, result: 85 } as CurrencyConversionResponse;
    const convertCurrencySpy = spyOn(fixerService, 'convertCurrency');
    fixerService.convertCurrency.and.returnValue(of(mockResponse));
    spyOn(component.mockedData, 'getConversion').and.returnValue(mockResponse);

    component.converterForm.setValue({
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      amount: 100
    });

    component.convertCurrency();

    expect(convertCurrencySpy).toHaveBeenCalledWith('USD', 'EUR', 100);
    expect(component.convertedAmount).toBe('85');
  });

  it('should not convert currency if form is invalid', () => {
    const convertCurrencySpy = spyOn(fixerService, 'convertCurrency');
    component.buildForm({});
    component.converterForm.setValue({
      fromCurrency: '',
      toCurrency: 'EUR',
      amount: 100
    });

    component.convertCurrency();

    expect(convertCurrencySpy).not.toHaveBeenCalled();
  });
});
