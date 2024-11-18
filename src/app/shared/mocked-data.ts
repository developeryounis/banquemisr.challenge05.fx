import { CurrencyConversionResponse } from "./models/currency.conversion.response.model";
import { CurrencyModel } from "./models/currency.model";
import { HistoricalCurrencyResponse } from "./models/historical.currency.response";
import { LatestExchangeRatesResponse } from "./models/latest.exchange.rates.response.model";

export class MockedData {
  private readonly _currencies: { [key: string]: CurrencyModel } = {
    USD: { name: "United States Dollar" },
    EUR: { name: "Euro" },
    GBP: { name: "British Pound Sterling" },
    CHF: { name: "Swiss Franc" },
    SAR: { name: "Saudi Riyal" },
    KWD: { name: "Kuwaiti Dinar" },
    EGP: { name: "Egyptian Pound" },
  };


  private _currencyPairs: { [key: string]: number } = {
    USDEUR: 0.92,
    EURUSD: 1.09,
    USDGBP: 0.74,
    GBPUSD: 1.35,
    USDCHF: 0.91,
    CHFUSD: 1.1,
    USDSAR: 3.75,
    SARUSD: 0.27,
    USDKWD: 0.31,
    KWDUSD: 3.22,
    USDEGP: 30.5,
    EGPUSD: 0.0328,
    EURGBP: 0.8,
    GBPEUR: 1.25,
    EURCHF: 0.98,
    CHFEUR: 1.02,
    EURSAR: 4.1,
    SAREUR: 0.244,
    EURKWD: 0.34,
    KWDEUR: 2.94,
    EUREGP: 33.2,
    EGPEUR: 0.030,
    GBPSAR: 4.96,
    SARGBP: 0.201,
    GBPKWD: 0.42,
    KWDGBP: 2.38,
    GBPEGP: 41.5,
    EGPGBP: 0.0241,
    CHFSAR: 4.12,
    SARCHF: 0.242,
    CHFKWD: 0.34,
    KWDCHF: 2.94,
    CHFEGP: 33.5,
    EGPCHF: 0.0299,
    SARKWD: 0.082,
    KWDSAR: 12.2,
    SAREGP: 8.13,
    EGPSAR: 0.123,
    KWDEGP: 99,
    EGPKWD: 0.0101,
    CHFGBP: 0.9331,
    GBPCHF: 1.0133
  };

  public getCurrencies(): { [key: string]: CurrencyModel } {
    Object.keys(this._currencies).forEach(key => this._currencies[key].disabled = false);
    return this._currencies;
  }

  public getConversion(from: string, to: string, amount: number): CurrencyConversionResponse {
    const rate = this._currencyPairs[`${from}${to}`];
    return {
      success: true,
      result: Number((rate * amount).toFixed(2)),
      date: new Date().toString(),
      info: {
        rate: rate,
        timestamp: new Date().getDate()
      },
      query: {
        amount: amount,
        from: from,
        to: to
      },
      historical: ''
    }
  }

  public getLatestExchangeRates(base: string, symbols: string): LatestExchangeRatesResponse {
    const latestRates = { base: base, date: new Date().toDateString(), success: true, timestamp: new Date().getDate(), rates: {} } as LatestExchangeRatesResponse;
    const currencies = symbols.split(',');
    currencies.forEach(currency => {
      if (currency != base) {
        const rate = this.getConversion(base, currency, 1);
        latestRates.rates[currency] = rate.info.rate;
      }
    });

    return latestRates;

  }

  public getHistoricalData(date: string, base: string, symbols: string): HistoricalCurrencyResponse {
    const historicalRates = { base: base, date: date, success: true, timestamp: new Date().getDate(), historical: true, rates: {} } as HistoricalCurrencyResponse;
    const currencies = symbols.split(',');
    currencies.forEach(currency => {
      if (currency != base) {
        const fluctuationPercentage = Math.random() * 0.1 - 0.05;
        const rateResponse = this.getConversion(base, currency, 1)
        const rate = rateResponse.info.rate * (1 + fluctuationPercentage);
        historicalRates.rates[currency] = rate;
      }
    });
    return historicalRates;
  }
}