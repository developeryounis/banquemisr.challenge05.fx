import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrencyListComponent } from './currency-list.component';
import { TestModule } from '../../test.module';
import { FixerService } from '../../services/fixer.service';
import { LatestExchangeRatesResponse } from '../../models/latest.exchange.rates.response.model';
import { of } from 'rxjs';

describe('CurrencyListComponent', () => {
  let component: CurrencyListComponent;
  let fixture: ComponentFixture<CurrencyListComponent>;
  let fixerService: jasmine.SpyObj<FixerService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CurrencyListComponent],
      imports: [TestModule]
    });
    fixture = TestBed.createComponent(CurrencyListComponent);
    component = fixture.componentInstance;
    fixerService = TestBed.inject(FixerService) as jasmine.SpyObj<FixerService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call getLatestExchangeRates if fromCurrency or toCurrency is not set', () => {
    component.fromCurrency = { value: null } as any;
    component.toCurrency = { value: 'EUR' } as any;
    component.setConversions();
    const getLatestExchangeRatesSpy = spyOn(fixerService, 'getLatestExchangeRates');
    expect(getLatestExchangeRatesSpy).not.toHaveBeenCalled();

    component.fromCurrency = { value: 'USD' } as any;
    component.toCurrency = { value: null } as any;
    component.setConversions();
    expect(getLatestExchangeRatesSpy).not.toHaveBeenCalled();
  });

  it('should call getLatestExchangeRates and populateConversionList if fromCurrency and toCurrency are set', () => {
    const mockResponse = {
      success: true,
      timestamp: 1625256000,
      base: 'USD',
      date: '2021-07-02',
      rates: {
        EUR: 0.85
      }
    } as LatestExchangeRatesResponse;
    component.fromCurrency.next('USD');
    component.toCurrency.next('EUR');
    const getLatestExchangeRatesSpy = spyOn(fixerService, 'getLatestExchangeRates');
    const populateConversionListSpy = spyOn(component, 'populateConversionList');
    fixerService.getLatestExchangeRates.and.returnValue(of(mockResponse));

    component.setConversions();

    expect(getLatestExchangeRatesSpy).toHaveBeenCalledWith('USD', 'EUR');
    expect(populateConversionListSpy).toHaveBeenCalledWith(mockResponse);
  });

  it('should populate conversion list', () => {
    const mockResponse = {
      success: true,
      timestamp: 1625256000,
      base: 'USD',
      date: '2021-07-02',
      rates: {
        EUR: 0.85
      }
    } as LatestExchangeRatesResponse;

    component.toCurrency.next('EUR');
    component.fromCurrency.next('USD');
    const formatConversionSpy = spyOn(component, 'formatConversion');

    component.populateConversionList(mockResponse);

    expect(component.fromRates.length).toBe(6);
    expect(component.toRates.length).toBe(6);
    expect(formatConversionSpy).toHaveBeenCalledTimes(12);
  });

  it('should use mocked data if response is not successful', () => {
    const mockResponse: LatestExchangeRatesResponse = {
      success: false,
      timestamp: 1625256000,
      base: 'USD',
      date: '2021-07-02',
      rates: {
        EUR: 0.85
      }
    };

    const mockedDataResponse: LatestExchangeRatesResponse = {
      success: true,
      timestamp: 1625256000,
      base: 'USD',
      date: '2021-07-02',
      rates: {
        EUR: 0.85
      }
    };

    component.toCurrency.next('EUR');
    component.fromCurrency.next('USD');
    const formatConversionSpy = spyOn(component, 'formatConversion');

    component.populateConversionList(mockResponse);

    expect(component.fromRates.length).toBe(6);
    expect(component.toRates.length).toBe(6);
    expect(formatConversionSpy).toHaveBeenCalledTimes(12);
  });
  
});
