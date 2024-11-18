import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyDetailsComponent } from './currency-details.component';
import { TestModule } from 'src/app/shared/test.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyService } from 'src/app/shared/services/currency.service';
import { FixerService } from 'src/app/shared/services/fixer.service';
import { HistoricalCurrencyResponse } from 'src/app/shared/models/historical.currency.reposnse';

describe('CurrencyDetailsComponent', () => {
  let component: CurrencyDetailsComponent;
  let fixture: ComponentFixture<CurrencyDetailsComponent>;
  let router: Router;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let fixerService: jasmine.SpyObj<FixerService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CurrencyDetailsComponent],
      imports: [TestModule, SharedModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ from: 'USD', to: 'EUR' })
          }
        }
      ]
    }).compileComponents();
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(CurrencyDetailsComponent);
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    fixerService = TestBed.inject(FixerService) as jasmine.SpyObj<FixerService>;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to home if fromCurrency or toCurrency is not set', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.route.queryParams = of({ from: null, to: 'EUR' });
    component.ngOnInit();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);

    component.route.queryParams = of({ from: 'USD', to: null });
    component.ngOnInit();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should set fromCurrency$ and toCurrency$ and call initialize if fromCurrency and toCurrency are set', () => {
    const initializeSpy = spyOn(component, 'initialize');
    component.route.queryParams = of({ from: 'USD', to: 'EUR' });
    component.ngOnInit();
    expect(component.fromCurrency$.value).toBe('USD');
    expect(component.toCurrency$.value).toBe('EUR');
    expect(initializeSpy).toHaveBeenCalled();
  });

  it('should call loadCurrencies and loadHistoricalData with the correct parameter', () => {
    const loadCurrenciesSpy = spyOn(component, 'loadCurrencies');
    const loadHistoricalDataSpy = spyOn(component, 'loadHistoricalData')
    component.toCurrency$.next('EUR');
    component.initialize();
    expect(loadCurrenciesSpy).toHaveBeenCalled();
    expect(loadHistoricalDataSpy).toHaveBeenCalledWith('EUR');
  });

  it('should load currencies and disable the fromCurrency', () => {
    const mockResponse = {
      USD: { name: 'United States Dollar' },
      EUR: { name: 'Euro' }
    };

    const getAllCurrenciesSpy = spyOn(currencyService, 'getAllCurrencies');
    const nextSpy = spyOn(component.isLoading$, 'next');

    currencyService.getAllCurrencies.and.returnValue(of(mockResponse));

    component.loadCurrencies();

    expect(getAllCurrenciesSpy).toHaveBeenCalled();
    expect(component.currencies).toEqual({
      USD: { name: 'United States Dollar', disabled: true },
      EUR: { name: 'Euro' }
    });
    expect(nextSpy).toHaveBeenCalledWith(false);
  });
  
  
  it('should load historical data and initialize historical data', () => {
    const mockDayResponse: HistoricalCurrencyResponse = { success: true, historical: true, date: '2021-07-01', base: 'USD', rates: { EUR: 0.85 }, timestamp: 1 };
    const mockMonthResponse: HistoricalCurrencyResponse = { success: true, historical: true, date: '2021-06-01', base: 'USD', rates: { EUR: 0.84 }, timestamp: 1 };
    const mockYearResponse: HistoricalCurrencyResponse = { success: true, historical: true, date: '2020-07-01', base: 'USD', rates: { EUR: 0.83 }, timestamp: 1 };
    const getHistoricalDataSpy = spyOn(fixerService, 'getHistoricalData');
    const nextSpy = spyOn(component.toCurrency$, 'next');
    fixerService.getHistoricalData.and.callFake((date, baseCurrency, symbols) => {
      if (date === '2021-07-01') return of(mockDayResponse);
      if (date === '2021-06-01') return of(mockMonthResponse);
      if (date === '2020-07-01') return of(mockYearResponse);
      return of({ rates: {} } as HistoricalCurrencyResponse);
    });
    component.loadHistoricalData('EUR');

    expect(nextSpy).toHaveBeenCalledWith('EUR');
    expect(getHistoricalDataSpy).toHaveBeenCalledTimes(3);
    expect(component.historicalDataResponse.length).toEqual(3);
  });

  it('should handle error and set historicalDataResponse to an empty array', () => {
    const getHistoricalDataSpy = spyOn(fixerService, 'getHistoricalData');
    const nextSpy = spyOn(component.toCurrency$, 'next');
    fixerService.getHistoricalData.and.returnValue(throwError(() => new Error('test')))

    component.loadHistoricalData('EUR');

    expect(nextSpy).toHaveBeenCalledWith('EUR');
    expect(getHistoricalDataSpy).toHaveBeenCalledTimes(3);
    expect(component.historicalDataResponse).toEqual([]);
  });

  it('should return correct historical dates', () => {
    const currentDate = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const expectedDay = formatDate(currentDate);
    const expectedMonth = formatDate(new Date(new Date().setMonth(currentDate.getMonth() - 1)));
    const expectedYear = formatDate(new Date(new Date().setFullYear(currentDate.getFullYear() - 1)));

    const historicalDates = component.getHistoricalDates();

    expect(historicalDates.day).toBe(expectedDay);
    expect(historicalDates.month).toBe(expectedMonth);
    expect(historicalDates.year).toBe(expectedYear);
  });
});
