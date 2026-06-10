from pathlib import Path
import torch
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from src.trainer import LSTMPredictor, create_sequences

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = PROJECT_ROOT / 'lstm_quant_model.pth'

def generate_predictions(df, seq_length=60, return_future=False):
    if df is None or df.empty or 'Date' not in df.columns or 'Close' not in df.columns:
        if return_future: return pd.DataFrame({'Date': [], 'LSTM_Prediction': []}), 0.0
        return pd.DataFrame({'Date': [], 'LSTM_Prediction': []})

    clean = df[['Date', 'Close']].dropna().reset_index(drop=True)
    if len(clean) <= seq_length:
        if return_future: return pd.DataFrame({'Date': clean['Date'], 'LSTM_Prediction': [np.nan] * len(clean)}), 0.0
        return pd.DataFrame({'Date': clean['Date'], 'LSTM_Prediction': [np.nan] * len(clean)})

    # 1. Scale Data
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_prices = scaler.fit_transform(clean['Close'].values.reshape(-1, 1))

    X, _ = create_sequences(scaled_prices, seq_length)
    if len(X) == 0:
        if return_future: return pd.DataFrame({'Date': clean['Date'], 'LSTM_Prediction': [np.nan] * len(clean)}), 0.0
        return pd.DataFrame({'Date': clean['Date'], 'LSTM_Prediction': [np.nan] * len(clean)})

    X = torch.tensor(X, dtype=torch.float32)
    model = LSTMPredictor(input_size=1, hidden_size=50, num_layers=2)

    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"LSTM model not found: {MODEL_PATH}")

    try:
        state = torch.load(MODEL_PATH, map_location='cpu', weights_only=True)
    except TypeError:
        state = torch.load(MODEL_PATH, map_location='cpu')
    model.load_state_dict(state)
    model.eval()

    # 2. Predict Historical (For the Chart)
    with torch.no_grad():
        preds = model(X).cpu().numpy().flatten()

    # 3. Predict TOMORROW (True Future Forecast)
    last_sequence = scaled_prices[-seq_length:]
    last_tensor = torch.tensor(last_sequence.reshape(1, seq_length, 1), dtype=torch.float32)
    with torch.no_grad():
        tomorrow_pred = model(last_tensor).cpu().numpy().flatten()[0]

    actuals = clean['Close'].values[seq_length:]

    # 4. Z-Score Amplitude Projection
    if len(actuals) > 0 and len(preds) > 0:
        preds_mean = np.mean(preds)
        preds_std = np.std(preds)
        z_scores = (preds - preds_mean) / (preds_std + 1e-8)

        actuals_mean = np.mean(actuals)
        actuals_std = np.std(actuals)

        final_aligned = (z_scores * actuals_std) + actuals_mean

        # Align Tomorrow's prediction using the exact same math
        tomorrow_z = (tomorrow_pred - preds_mean) / (preds_std + 1e-8)
        tomorrow_aligned = (tomorrow_z * actuals_std) + actuals_mean
    else:
        final_aligned = preds
        tomorrow_aligned = tomorrow_pred

    final_preds = [np.nan] * seq_length + final_aligned.tolist()

    predictions_df = pd.DataFrame({
        'Date': clean['Date'],
        'LSTM_Prediction': final_preds
    })

    # Return the Tuple ONLY if explicitly requested
    if return_future:
        return predictions_df, tomorrow_aligned
        
    return predictions_df