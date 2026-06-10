import streamlit as st
import yfinance as yf

st.set_page_config(page_title="QuantEngine | Dashboard", layout="wide", page_icon="🌱")

POPULAR_STOCKS = {
    "Reliance Industries (RELIANCE.NS)": "RELIANCE.NS",
    "Tata Consultancy Services (TCS.NS)": "TCS.NS",
    "HDFC Bank (HDFCBANK.NS)": "HDFCBANK.NS",
    "Zomato (ZOMATO.NS)": "ZOMATO.NS",
    "Apple (AAPL)": "AAPL",
    "Nvidia (NVDA)": "NVDA",
    "Tesla (TSLA)": "TSLA",
    "🔍 Type a Custom Stock Ticker...": "CUSTOM"
}

if 'ticker' not in st.session_state:
    st.session_state['ticker'] = 'RELIANCE.NS'

st.title("🌱 QuantEngine Dashboard")

col1, col2 = st.columns([1, 2.5])

with col1:
    st.markdown("### 🔍 Search Market")
    selected_option = st.selectbox("Pick a popular stock or search:", options=list(POPULAR_STOCKS.keys()))
    
    if POPULAR_STOCKS[selected_option] == "CUSTOM":
        custom_ticker = st.text_input("Enter Ticker (e.g., INTC, TATAMOTORS.NS):")
        active_ticker = custom_ticker.upper() if custom_ticker else st.session_state['ticker']
    else:
        active_ticker = POPULAR_STOCKS[selected_option]

    if active_ticker != st.session_state['ticker'] and active_ticker != "":
        st.session_state['ticker'] = active_ticker
        st.rerun()

@st.cache_data(ttl=3600)
def get_stock_profile(ticker):
    try:
        tk = yf.Ticker(ticker)
        info = tk.info if tk.info else {}
        hist = tk.history(period="5d")
        if hist.empty: return {}, 0.0, 0.0
        curr = hist['Close'].iloc[-1]
        prev = hist['Close'].iloc[-2]
        return info, curr, (curr - prev)
    except:
        return {}, 0.0, 0.0

with st.spinner(f"Loading data for {st.session_state['ticker']}..."):
    info, current_price, price_change = get_stock_profile(st.session_state['ticker'])

    if current_price > 0:
        pct_change = (price_change / (current_price - price_change)) * 100
        curr_code = info.get('currency', 'INR')
        sym = '₹' if curr_code == 'INR' else '$'
        st.session_state['currency_sym'] = sym

        with col2:
            # --- RETAIL INVESTOR HEADER ---
            st.markdown(f"## {info.get('longName', st.session_state['ticker'])}")
            
            # Fetch company logo 
            website = info.get('website', '')
            if website:
                domain = website.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
                st.image(f"https://logo.clearbit.com/{domain}", width=60)
            
            # Big, Clean Price Display
            color = "green" if price_change >= 0 else "red"
            arrow = "▲" if price_change >= 0 else "▼"
            st.markdown(f"<h1 style='color: {color}; margin-bottom: 0px;'>{sym}{current_price:,.2f}</h1>", unsafe_allow_html=True)
            st.markdown(f"<h4 style='color: {color}; margin-top: 0px;'>{arrow} {sym}{abs(price_change):,.2f} ({pct_change:.2f}%) Today</h4>", unsafe_allow_html=True)

            # Plain English Company Summary
            summary = info.get('longBusinessSummary', 'No company description available.')
            short_summary = " ".join(summary.split(". ")[:2]) + "." if summary else ""
            st.caption(f"**What they do:** {short_summary}")

        st.markdown("---")

        # --- REAL PAPER TRADING PORTFOLIO ---
        st.markdown("### 💼 Your Portfolio")
        
        # 1. Initialize the User's Bank & Ledger
        if 'portfolio' not in st.session_state:
            st.session_state['portfolio'] = {} # Format: {'RELIANCE.NS': {'shares': 0, 'avg_price': 0}}
        if 'cash' not in st.session_state:
            st.session_state['cash'] = 100000.0 # Give the user ₹1 Lakh to start!

        # 2. Fetch the user's actual holdings for the active stock
        holdings = st.session_state['portfolio'].get(st.session_state['ticker'], {'shares': 0.0, 'avg_price': 0.0})
        shares_owned = holdings['shares']
        avg_price = holdings['avg_price']

        # 3. Calculate Real P&L Math
        invested = shares_owned * avg_price
        current_val = shares_owned * current_price
        profit = current_val - invested
        profit_pct = ((current_val / invested) - 1) * 100 if invested > 0 else 0.0
        profit_color = "normal" if profit >= 0 else "inverse"

        # 4. Display the Live Ledger
        pcol1, pcol2, pcol3, pcol4 = st.columns(4)
        pcol1.metric("Available Cash", f"{sym}{st.session_state['cash']:,.2f}")
        pcol2.metric("Asset Value", f"{sym}{current_val:,.2f}")
        
        if invested > 0:
            pcol3.metric("Unrealized Profit", f"{sym}{profit:,.2f}", f"{profit_pct:.2f}% All Time", delta_color=profit_color)
            pcol4.metric("Shares Owned", f"{shares_owned} shares", f"Avg: {sym}{avg_price:,.2f}")
        else:
            pcol3.metric("Unrealized Profit", f"{sym}0.00", "0.00%")
            pcol4.metric("Shares Owned", "0 shares", "Not Owned")

        st.markdown("<br>", unsafe_allow_html=True)

        # --- 5. THE TRADING TERMINAL ---
        with st.expander("⚡ Execute Trade"):
            tcol1, tcol2, tcol3 = st.columns([1, 1, 2])
            trade_qty = tcol1.number_input("Quantity", min_value=1, value=1, step=1)
            action = tcol2.radio("Action", ["Buy", "Sell"], horizontal=True)
            
            total_value = trade_qty * current_price
            tcol3.info(f"**Order Value:** {sym}{total_value:,.2f}")

            if st.button("Submit Order", use_container_width=True):
                if action == "Buy":
                    if st.session_state['cash'] >= total_value:
                        # Deduct cash
                        st.session_state['cash'] -= total_value
                        # Calculate new average price (Averaging down/up)
                        new_shares = shares_owned + trade_qty
                        new_avg = ((shares_owned * avg_price) + total_value) / new_shares
                        # Save to ledger
                        st.session_state['portfolio'][st.session_state['ticker']] = {'shares': new_shares, 'avg_price': new_avg}
                        st.success(f"Successfully bought {trade_qty} shares of {st.session_state['ticker']}!")
                        st.rerun() # Refresh the page instantly
                    else:
                        st.error("Insufficient funds in your Available Cash!")
                        
                elif action == "Sell":
                    if shares_owned >= trade_qty:
                        # Add cash
                        st.session_state['cash'] += total_value
                        # Update ledger
                        new_shares = shares_owned - trade_qty
                        if new_shares == 0:
                            st.session_state['portfolio'].pop(st.session_state['ticker']) # Remove from portfolio if 0
                        else:
                            st.session_state['portfolio'][st.session_state['ticker']] = {'shares': new_shares, 'avg_price': avg_price}
                        st.success(f"Successfully sold {trade_qty} shares of {st.session_state['ticker']}!")
                        st.rerun()
                    else:
                        st.error("You do not own enough shares to sell that quantity!")