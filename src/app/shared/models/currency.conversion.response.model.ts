export interface CurrencyConversionResponse {
    success: boolean;
    query: {
        from: string;
        to: string;
        amount: number;
    };
    info: {
        timestamp: number;
        rate: number;
    };
    historical: string;
    date: string;
    result: number;
    error: {
        info: string;
    }
}
