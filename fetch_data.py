import yfinance as yf
import pandas as pd

print("Fetching 10 years of clean Apple (AAPL) stock data...")

# Using the Ticker method returns a clean, flat dataset without MultiIndex headers
apple = yf.Ticker("AAPL")
df = apple.history(start='2014-01-01', end='2024-05-14')

# Clean up the index and remove timezone data to prevent pandas errors
df.reset_index(inplace=True)
df['Date'] = pd.to_datetime(df['Date']).dt.tz_localize(None)

# Save the clean data, overwriting the old bad file
df.to_csv('data.csv', index=False)

print("Success! Clean data saved as 'data.csv'.")