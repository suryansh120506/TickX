import streamlit as st
import pandas as pd
import yfinance as yf
import plotly.graph_objects as go
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.predictor import generate_predictions

st.set_page_config(page_title="Predictive AI | QuantEngine", layout="wide")

active_ticker = st.session_state.get('ticker', 'RELIANCE.NS')
sym = st.session_state.get('currency_sym', '₹')

st.title(f"📈 Predictive AI: {active_ticker}")
st.markdown(f"Forecasting future price action for **{active_ticker}** using a Long Short-Term Memory (LSTM) neural network.")

@st.cache_data(ttl=3600)
def load_dynamic_data(ticker_symbol):
    stock = yf.Ticker(ticker_symbol)
    df = stock.history(period="10y")
    df.reset_index(inplace=True)
    if 'Date' not in df.columns:
        df.rename(columns={'index': 'Date'}, inplace=True)
    df['Date'] = pd.to_datetime(df['Date']).dt.tz_localize(None)
    return df

try:
    with st.spinner(f"Downloading historical data for {active_ticker}..."):
        df = load_dynamic_data(active_ticker)
    
    if df.empty:
        st.error(f"Could not fetch data for {active_ticker}.")
    else:
        st.sidebar.header("Model Parameters")
        display_days = st.sidebar.slider("Days of History to Display", min_value=100, max_value=1000, value=300, step=50)

        with st.spinner(f"AI is calculating forward projections for {active_ticker}..."):
            
            # --- THE FIX: Call the engine with return_future=True ---
            full_predictions_df, next_day_target = generate_predictions(df, seq_length=60, return_future=True)
            
            full_plot_df = pd.merge(df, full_predictions_df, on='Date', how='inner')
            plot_df = full_plot_df.tail(display_days).copy().reset_index(drop=True)
            
            current_price = plot_df['Close'].iloc[-1]
            
            # Use the True Future Target for the math!
            delta = next_day_target - current_price
            delta_pct = (delta / current_price) * 100
            
            col1, col2, col3 = st.columns(3)
            col1.metric(f"{active_ticker} Current Price", f"{sym}{current_price:,.2f}")
            col2.metric("Next Day AI Target", f"{sym}{next_day_target:,.2f}", f"{delta_pct:.2f}%")
            col3.metric("Model Status", "Live Inference")
            st.markdown("---")
            
            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=plot_df['Date'], y=plot_df['Close'],
                mode='lines', name='Actual Price',
                line=dict(color='#2E86C1', width=2)
            ))
            fig.add_trace(go.Scatter(
                x=plot_df['Date'], y=plot_df['LSTM_Prediction'],
                mode='lines', name='AI Prediction (LSTM)',
                line=dict(color='#F39C12', width=2, dash='dash')
            ))
            
            fig.update_layout(
                title=f"Real-Time Price Action Forecast: {active_ticker}",
                xaxis_title="Date", yaxis_title=f"Price ({sym})",
                hovermode="x unified", template="plotly_white"
            )
            st.plotly_chart(fig, use_container_width=True)

except Exception as e:
    st.error("Engine failure. Check the traceback below:")
    st.exception(e)