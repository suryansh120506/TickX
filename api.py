from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from src.predictor import generate_predictions
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/predict/{ticker}")
def get_prediction(ticker: str):
    try:
        # --- THE BULK DOWNLOAD BYPASS ---
        # yf.download hits a completely different, less-secure Yahoo endpoint
        df = yf.download(tickers=ticker, period="2y", interval="1d", progress=False)
        
        # Fallback to 1 year if 2 years fails
        if df.empty:
            df = yf.download(tickers=ticker, period="1y", interval="1d", progress=False)

        # THE SHIELD
        if df.empty:
            raise HTTPException(status_code=404, detail=f"Yahoo Finance bulk download blocked for {ticker}.")

        # Flatten the data structure and clean corrupted rows
        df = df.reset_index()
        df = df.dropna()

        if df.empty:
            raise HTTPException(status_code=404, detail=f"Data fetched for {ticker} was corrupted.")

        # --- THE FAST INFO BYPASS ---
        # Ticker.info gets blocked easily. fast_info is instant and highly resilient.
        stock = yf.Ticker(ticker)
        
        try:
            current_price = float(stock.fast_info['lastPrice'])
            raw_market_cap = float(stock.fast_info['marketCap'])
        except Exception:
            # Absolute worst-case fallback: calculate it ourselves from the dataframe
            # If the download returns a MultiIndex (newer yfinance versions), handle it safely
            if isinstance(df.columns, pd.MultiIndex):
                current_price = float(df['Close'].iloc[-1].iloc[0])
            else:
                current_price = float(df['Close'].iloc[-1])
            raw_market_cap = 0

        # Attempt to get company name/website safely, fallback to defaults if Yahoo blocks it
        company_name = ticker.upper()
        website = ""
        sector = "Equities / Tech"
        
        try:
            info = stock.info
            company_name = info.get('longName', company_name)
            website = info.get('website', website)
            sector = info.get('sector', sector)
        except Exception:
            pass # Ignore info blocks, we have the price data!

        # Format Market Cap
        if raw_market_cap > 1e12:
            market_cap_str = f"₹{raw_market_cap / 1e12:.2f}T" if ticker.upper().endswith('.NS') else f"${raw_market_cap / 1e12:.2f}T"
        elif raw_market_cap > 1e9:
            market_cap_str = f"₹{raw_market_cap / 1e9:.2f}B" if ticker.upper().endswith('.NS') else f"${raw_market_cap / 1e9:.2f}B"
        elif raw_market_cap > 0:
            market_cap_str = f"${raw_market_cap:,}"
        else:
            market_cap_str = "Institutional Grade"

        # --- AI PREDICTION ---
        # Note: Depending on yfinance version, 'Close' might be a MultiIndex column. 
        # The predictor expects a flat 'Close' column.
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)

        predictions, next_day = generate_predictions(df, seq_length=60, return_future=True)

        return {
            "ticker": ticker.upper(),
            "current_price": current_price,
            "ai_target": float(next_day),
            "company_name": company_name,
            "website": website,
            "sector": sector,
            "market_cap": market_cap_str
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))