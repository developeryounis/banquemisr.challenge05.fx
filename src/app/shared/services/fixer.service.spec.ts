import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { FixerService } from './fixer.service';
import { CurrencyConversionResponse } from '../models/currency.conversion.response.model';
import { environment } from 'src/environments/environment';
import { TestModule } from '../test.module';
import { LatestExchangeRatesResponse } from '../models/latest.exchange.rates.response.model';
import { HistoricalCurrencyResponse } from '../models/historical.currency.reposnse';

describe('FixerService', () => {
  let service: FixerService;
  let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
    });
    service = TestBed.inject(FixerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert currency', () => {
    const from = 'USD';
    const to = 'EUR';
    const amount = 100;
    const mockResponse = {
      success: true,
      query: { from, to, amount },
      info: { timestamp: 1625256000, rate: 0.85 },
      result: 85
    } as CurrencyConversionResponse;

    service.convertCurrency(from, to, amount).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['baseUrl']}/convert?access_key=${environment.fixerAccessKey}&from=${from}&to=${to}&amount=${amount}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
  it('should get latest exchange rates', () => {
    const baseCurrency = 'USD';
    const symbols = 'GBP,JPY,EUR';
    const mockResponse = {
      success: true,
      timestamp: 1625256000,
      base: baseCurrency,
      date: '2021-07-02',
      rates: {
        GBP: 0.72,
        JPY: 110.57,
        EUR: 0.85
      }
    } as LatestExchangeRatesResponse;

    service.getLatestExchangeRates(baseCurrency, symbols).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['baseUrl']}/latest?access_key=${environment.fixerAccessKey}&base=${baseCurrency}&symbols=${symbols}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

   it('should get historical data', () => {
    const date = '2021-07-01';
    const baseCurrency = 'USD';
    const symbols = 'GBP,JPY,EUR';
    const mockResponse = {
      success: true,
      historical: true,
      date: date,
      base: baseCurrency,
      rates: {
        GBP: 0.72,
        JPY: 110.57,
        EUR: 0.85
      },
      timestamp: 1
    } as HistoricalCurrencyResponse;

    service.getHistoricalData(date, baseCurrency, symbols).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['baseUrl']}/${date}?access_key=${environment.fixerAccessKey}&base=${baseCurrency}&symbols=${symbols}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
