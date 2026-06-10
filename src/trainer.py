import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from pathlib import Path
from sklearn.preprocessing import MinMaxScaler
import joblib

PROJECT_ROOT = Path(__file__).resolve().parents[1]

# --- LSTM Model Architecture ---
class LSTMPredictor(nn.Module):
    def __init__(self, input_size=1, hidden_size=50, num_layers=2):
        super(LSTMPredictor, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        out, _ = self.lstm(x)
        out = self.fc(out[:, -1, :]) # Take the last time step
        return out

def create_sequences(data, seq_length):
    xs, ys = [], []
    for i in range(len(data) - seq_length):
        xs.append(data[i:(i + seq_length)])
        ys.append(data[i + seq_length])
    return np.array(xs), np.array(ys)

def train_model(df_path, seq_length=60, epochs=50, learning_rate=0.001):
    print("Initiating Training Pipeline...")
    
    # 1. Load Data
    df = pd.read_csv(df_path)
    df['Date'] = pd.to_datetime(df['Date'])
    df = df.sort_values('Date')
    
    # 2. Strict Train/Test Split BEFORE Scaling (80/20 split)
    train_size = int(len(df) * 0.8)
    train_df = df.iloc[:train_size].copy()
    
    # 3. Initialize and FIT the scaler ONLY on training data
    scaler = MinMaxScaler(feature_range=(0, 1))
    train_prices = train_df['Close'].values.reshape(-1, 1)
    scaled_train = scaler.fit_transform(train_prices)
    
    # 4. Save the Scaler (CRUCIAL FIX)
    joblib.dump(scaler, PROJECT_ROOT / 'quant_scaler.gz')
    print("Scaler fitted on Training Data and saved as 'quant_scaler.gz'")
    
    # 5. Create Sequences
    X_train, y_train = create_sequences(scaled_train, seq_length)
    X_train = torch.tensor(X_train, dtype=torch.float32)
    y_train = torch.tensor(y_train, dtype=torch.float32)
    
    # 6. Train the LSTM
    model = LSTMPredictor()
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    
    print("Training LSTM...")
    for epoch in range(epochs):
        model.train()
        optimizer.zero_grad()
        output = model(X_train)
        loss = criterion(output, y_train)
        loss.backward()
        optimizer.step()
        
        if (epoch+1) % 10 == 0:
            print(f'Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.6f}')
            
    # 7. Save the Model
    torch.save(model.state_dict(), PROJECT_ROOT / 'lstm_quant_model.pth')
    print("Model saved as 'lstm_quant_model.pth'")

if __name__ == "__main__":
    # Example usage (Replace 'data.csv' with your actual historical data file)
    # train_model('data.csv')
    pass