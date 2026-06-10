import streamlit as st
import pandas as pd
import yfinance as yf
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv
from src.predictor import generate_predictions
from src.trading_env import QuantitativeTradingEnv

st.set_page_config(page_title="Robo-Advisor | QuantEngine", layout="wide")
active_ticker = st.session_state.get('ticker', 'AAPL')
sym = st.session_state.get('currency_sym', '₹')

st.title(f"Autonomous Trading Bot: {active_ticker}")
st.markdown("Customize your trading parameters below to backtest the AI's performance. The engine dynamically calculates if the algorithmic strategy outperformed standard market holding.")

# --- DYNAMIC USER CONTROLS ---
st.sidebar.header("Strategy Parameters")
user_capital = st.sidebar.number_input(f"Starting Capital ({sym})", min_value=1000, max_value=10000000, value=100000, step=5000)
user_risk = st.sidebar.slider("Position Sizing (% of cash per trade)", min_value=10, max_value=100, value=100, step=10) / 100.0
backtest_days = st.sidebar.slider("Backtest Duration (Trading Days)", min_value=30, max_value=1000, value=250, step=30)

@st.cache_data(ttl=3600)
def prepare_market_data(ticker_symbol, days):
    stock = yf.Ticker(ticker_symbol)
    df = stock.history(period="5y").reset_index()
    if 'Date' not in df.columns: df.rename(columns={'index': 'Date'}, inplace=True)
    df['Date'] = pd.to_datetime(df['Date']).dt.tz_localize(None)
    
    preds = generate_predictions(df, seq_length=60)
    merged = pd.merge(df, preds, on='Date', how='inner')
    
    merged['Daily_Return'] = merged['Close'].pct_change()
    merged['Volatility_14d'] = merged['Daily_Return'].rolling(window=14).std()
    merged['Momentum_14d'] = merged['Daily_Return'].rolling(window=14).mean()
    merged = merged.dropna().reset_index(drop=True)
    
    scaler = StandardScaler()
    features = scaler.fit_transform(merged[['Volatility_14d', 'Momentum_14d']])
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    merged['Regime'] = kmeans.fit_predict(features)
    
    regime_labels = {}
    for r in range(3):
        r_data = merged[merged['Regime'] == r]
        mom = r_data['Momentum_14d'].mean()
        if mom > 0.0005: regime_labels[r] = "🟢 Bull Market"
        elif mom < -0.0005: regime_labels[r] = "🔴 Bear Market"
        else: regime_labels[r] = "🟡 Sideways Range"
    
    merged['Regime_Name'] = merged['Regime'].map(regime_labels)
    return merged.tail(days).reset_index(drop=True)

def run_simulation(test_data, cap, risk):
    env = DummyVecEnv([lambda: QuantitativeTradingEnv(test_data, test_data, initial_balance=cap, trade_size_pct=risk)])
    try: model = PPO.load("elite_quant_agent")
    except: return None
        
    obs = env.reset()
    done = False
    history = []
    
    while not done:
        current_step = env.envs[0].current_step
        action, _ = model.predict(obs, deterministic=True)
        obs, reward, done, info = env.step(action)
        done = done[0]
        
        act_str = "Hold"
        if action[0] == 1: act_str = "Buy"
        elif action[0] == 2: act_str = "Sell"
            
        history.append({
            'Date': test_data.loc[current_step, 'Date'], 
            'Price': test_data.loc[current_step, 'Close'], 
            'Action': act_str, 
            'Net Worth': info[0]['net_worth'],
            'Cash_Left': env.envs[0].balance,
            'Shares_Held': env.envs[0].shares_held,
            'Market Phase': test_data.loc[current_step, 'Regime_Name']
        })
    return pd.DataFrame(history)

with st.spinner(f"Simulating AI Backtest for {active_ticker}..."):
    try:
        test_data = prepare_market_data(active_ticker, backtest_days)
        trade_log = run_simulation(test_data, user_capital, user_risk)

        if trade_log is not None and not trade_log.empty:
            # --- 1. CORE INVESTOR METRICS ---
            final_cap = trade_log['Net Worth'].iloc[-1]
            ai_roi = ((final_cap - user_capital) / user_capital) * 100
            
            # Calculate Benchmark (Buy & Hold from Day 1)
            start_price = trade_log['Price'].iloc[0]
            end_price = trade_log['Price'].iloc[-1]
            market_roi = ((end_price - start_price) / start_price) * 100
            
            # Calculate Alpha (Did AI beat the market?)
            alpha = ai_roi - market_roi
            alpha_color = "normal" if alpha > 0 else "inverse"
            
            final_cash = trade_log['Cash_Left'].iloc[-1]
            final_shares = trade_log['Shares_Held'].iloc[-1]

            col1, col2, col3, col4 = st.columns(4)
            col1.metric("AI Portfolio Ending Value", f"{sym}{final_cap:,.2f}", f"AI Return: {ai_roi:.2f}%")
            col2.metric("Market Benchmark (Buy & Hold)", f"Return: {market_roi:.2f}%", f"Alpha: {alpha:.2f}%", delta_color=alpha_color)
            col3.metric("Current Asset Allocation", f"{final_shares:.2f} Shares", f"Free Cash: ₹{final_cash:,.2f}")
            col4.metric("Current Market Phase", f"{trade_log['Market Phase'].iloc[-1]}")
            
            st.markdown("---")
            
            # --- 2. SPLIT-PANE INDUSTRY CHART ---
            fig = make_subplots(
                rows=2, cols=1, 
                shared_xaxes=True, 
                vertical_spacing=0.1,
                row_heights=[0.6, 0.4],
                subplot_titles=(f"{active_ticker} Price Action & Executions", "Cumulative Portfolio Wealth ($)")
            )
            
            # Top Chart: Stock Price
            fig.add_trace(go.Scatter(x=trade_log['Date'], y=trade_log['Price'], name="Asset Price", line=dict(color="#2E86C1", width=2)), row=1, col=1)
            
            # Buy / Sell Markers
            buys = trade_log[trade_log['Action'] == 'Buy']
            fig.add_trace(go.Scatter(x=buys['Date'], y=buys['Price'], mode='markers', marker=dict(symbol='triangle-up', size=14, color='#27AE60', line=dict(width=2, color='DarkSlateGrey')), name='Buy Signal'), row=1, col=1)
            
            sells = trade_log[trade_log['Action'] == 'Sell']
            fig.add_trace(go.Scatter(x=sells['Date'], y=sells['Price'], mode='markers', marker=dict(symbol='triangle-down', size=14, color='#E74C3C', line=dict(width=2, color='DarkSlateGrey')), name='Sell Signal'), row=1, col=1)
            
            # Bottom Chart: Portfolio Growth (Equity Curve)
            fig.add_trace(go.Scatter(x=trade_log['Date'], y=trade_log['Net Worth'], name="Portfolio Value", fill='tozeroy', line=dict(color="#8E44AD", width=2)), row=2, col=1)
            
            fig.update_layout(hovermode="x unified", template="plotly_white", height=700, showlegend=True)
            st.plotly_chart(fig, use_container_width=True)
            
            with st.expander("View Raw Trade Logic & Logs"):
                st.dataframe(trade_log.style.map(lambda x: 'background-color: #d4edda' if x == 'Buy' else ('background-color: #f8d7da' if x == 'Sell' else ''), subset=['Action']))
    except Exception as e:
        st.error(f"Simulation failed: {e}")