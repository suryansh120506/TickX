import streamlit as st
import pandas as pd
from textblob import TextBlob
import plotly.graph_objects as go
import urllib.request
import xml.etree.ElementTree as ET

st.set_page_config(page_title="Market Pulse | QuantEngine", layout="wide")

# Fetch active ticker
active_ticker = st.session_state.get('ticker', 'RELIANCE.NS')

st.title(f"📰 AI Market Pulse: {active_ticker}")
st.markdown("This module uses **Natural Language Processing (NLP)** to scrape live financial news and gauge the emotional sentiment of the market in real-time.")

# --- Bulletproof Google News RSS Engine ---
@st.cache_data(ttl=600) 
def fetch_and_analyze_news(ticker_symbol):
    # Swapped from dead Yahoo RSS to highly reliable Google News RSS
    url = f"https://news.google.com/rss/search?q={ticker_symbol}+stock&hl=en-IN&gl=IN&ceid=IN:en"
    
    bearish_keywords = ['drop', 'fall', 'plunge', 'crash', 'sell-off', 'decline', 'loss', 'miss', 'bear', 'lawsuit', 'investigation', 'down']
    bullish_keywords = ['surge', 'jump', 'soar', 'beat', 'record', 'dividend', 'buy', 'bull', 'up', 'gain', 'profit']

    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        xml_data = response.read()
        root = ET.fromstring(xml_data)
        
        analyzed_articles = []
        total_polarity = 0
        items = root.findall('./channel/item')[:10]
        
        for item in items:
            title = item.find('title').text
            link = item.find('link').text
            
            blob = TextBlob(title)
            polarity = blob.sentiment.polarity
            
            title_lower = title.lower()
            for word in bearish_keywords:
                if word in title_lower: polarity -= 0.3
            for word in bullish_keywords:
                if word in title_lower: polarity += 0.2
                
            total_polarity += polarity
            
            if polarity > 0.05: sentiment_label = "🟢 Bullish"
            elif polarity < -0.05: sentiment_label = "🔴 Bearish"
            else: sentiment_label = "⚪ Neutral"
                
            analyzed_articles.append({
                "Headline": title,
                "Sentiment": sentiment_label,
                "Score": polarity,
                "Link": link
            })
            
        avg_polarity = total_polarity / len(analyzed_articles) if analyzed_articles else 0
        return pd.DataFrame(analyzed_articles), avg_polarity
        
    except Exception as e:
        return pd.DataFrame(), 0

# --- Execution ---
with st.spinner(f"Scraping live news for {active_ticker}..."):
    news_df, overall_score = fetch_and_analyze_news(active_ticker)
    
    if not news_df.empty:
        st.subheader(f"Real-Time Sentiment Analysis: {active_ticker}")
        
        if overall_score > 0.1: mood = "Bullish"
        elif overall_score < -0.1: mood = "Bearish"
        else: mood = "Neutral"
            
        col1, col2 = st.columns([1, 2])
        
        with col1:
            st.metric("Overall Market Mood", mood, f"NLP Score: {overall_score:.2f}")
            
            fig = go.Figure(go.Indicator(
                mode = "gauge+number",
                value = overall_score,
                domain = {'x': [0, 1], 'y': [0, 1]},
                gauge = {
                    'axis': {'range': [-1, 1]},
                    'bar': {'color': "black"},
                    'steps': [
                        {'range': [-1, -0.05], 'color': "#ffcccc"},
                        {'range': [-0.05, 0.05], 'color': "#f2f2f2"},
                        {'range': [0.05, 1], 'color': "#ccffcc"}],
                },
                title = {'text': "AI Sentiment Meter"}
            ))
            fig.update_layout(height=250, margin=dict(l=10, r=10, t=40, b=10))
            st.plotly_chart(fig, use_container_width=True)
            
        with col2:
            st.markdown("### Live NLP News Feed")
            for index, row in news_df.iterrows():
                with st.container():
                    cols = st.columns([1, 5, 1])
                    cols[0].write(row['Sentiment'])
                    cols[1].markdown(f"**[{row['Headline']}]({row['Link']})**")
                    cols[2].write(f"Score: {row['Score']: .2f}")
                    st.divider()
    else:
        st.warning("No recent news found for this ticker, or the RSS feed is temporarily unreachable.")