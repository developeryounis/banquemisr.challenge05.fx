export interface HistoricalCurrencyResponse {
    success: boolean;
    historical: boolean;
    date: string;
    timestamp: number;
    base: string;
    rates: { [key: string]: number };
}