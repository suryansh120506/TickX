from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from src.predictor import generate_predictions

app = FastAPI()

# Allow your React frontend to talk to this Python backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/predict/{ticker}")
def get_prediction(ticker: str):
    stock = yf.Ticker(ticker)
    df = stock.history(period="10y").reset_index()

    # 1. Fetch company profile metadata dynamically
    try:
        info = stock.info if stock.info else {}
    except Exception:
        info = {}

    company_name = info.get('longName', ticker.upper())
    website = info.get('website', '')
    sector = info.get('sector', 'Technology / Finance')
    raw_market_cap = info.get('marketCap', 0)

    # Clean formatting for Market Cap values
    if raw_market_cap > 1e12:
        market_cap_str = f"₹{raw_market_cap / 1e12:.2f}T" if ticker.upper().endswith('.NS') else f"${raw_market_cap / 1e12:.2f}T"
    elif raw_market_cap > 1e9:
        market_cap_str = f"₹{raw_market_cap / 1e9:.2f}B" if ticker.upper().endswith('.NS') else f"${raw_market_cap / 1e9:.2f}B"
    elif raw_market_cap > 0:
        market_cap_str = f"${raw_market_cap:,}"
    else:
        market_cap_str = "Institutional Grade"

    # 2. Run your existing AI math
    predictions, next_day = generate_predictions(df, seq_length=60, return_future=True)

    # 3. Return complete data payload to Next.js
    return {
        "ticker": ticker.upper(),
        "current_price": float(df['Close'].iloc[-1]),
        "ai_target": float(next_day),
        "company_name": company_name,
        "website": website,
        "sector": sector,
        "market_cap": market_cap_str
    }