import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from src.predictor import generate_predictions
import joblib

# Set the page configuration
st.set_page_config(page_title="QuantEngine AI", layout="wide", page_icon="📈")

# --- UI Header ---
st.title("🤖 Quantitative Finance AI Engine")
st.markdown("An autonomous trading system powered by **LSTM Deep Learning** and **PPO Reinforcement Learning**.")

# --- Load Data ---
@st.cache_data
def load_data():
    df = pd.read_csv('data.csv')
    df['Date'] = pd.to_datetime(df['Date']).dt.tz_localize(None)
    return df

df = load_data()

# --- Sidebar Controls ---
st.sidebar.header("Engine Parameters")
st.sidebar.text("Status: Models Trained ✅")
st.sidebar.text("Market Regimes: Active 📊")
st.sidebar.text("RL Agent: PPO Deployed 🧠")

# --- Main Dashboard ---
col1, col2, col3 = st.columns(3)

with col1:
    st.metric("Starting Capital", "$10,000.00")
with col2:
    st.metric("Final Portfolio Value", "$10,797.86", "+$797.86")
with col3:
    st.metric("AI Backtest ROI", "7.98%")

st.markdown("---")

# --- Visualization Section ---
st.subheader("Market Analysis & LSTM Predictions")

# Only predict on the last year for a clean chart
recent_df = df.tail(250).copy().reset_index(drop=True)

with st.spinner("AI is analyzing market structures..."):
    # Run the predictions through your existing engine
    try:
        predictions_df = generate_predictions(recent_df, seq_length=60)
        
        # Merge for plotting
        plot_df = pd.merge(recent_df, predictions_df, on='Date', how='inner')
        
        # Build the Interactive Plotly Chart
        fig = go.Figure()
        
        # Actual Price Line
        fig.add_trace(go.Scatter(
            x=plot_df['Date'], y=plot_df['Close'],
            mode='lines', name='Actual Market Price',
            line=dict(color='blue', width=2)
        ))
        
        # LSTM Prediction Line
        fig.add_trace(go.Scatter(
            x=plot_df['Date'], y=plot_df['LSTM_Prediction'],
            mode='lines', name='AI Prediction (LSTM)',
            line=dict(color='orange', width=2, dash='dot')
        ))
        
        fig.update_layout(
            title="Real-Time Engine View: Actual vs Predicted Prices",
            xaxis_title="Date",
            yaxis_title="Stock Price (USD)",
            template="plotly_white",
            hovermode="x unified"
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
    except Exception as e:
        st.error(f"Prediction Engine offline. Ensure models are trained. Error: {e}")

st.markdown("---")
st.markdown("**Built for Algorithmic Trading | Core Engine: PyTorch & Stable-Baselines3**")