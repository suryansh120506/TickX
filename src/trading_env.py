import gymnasium as gym
from gymnasium import spaces
import numpy as np

class QuantitativeTradingEnv(gym.Env):
    def __init__(self, df, predictions, initial_balance=10000.0, trade_size_pct=1.0):
        super(QuantitativeTradingEnv, self).__init__()
        self.df = df.reset_index(drop=True)
        self.predictions = predictions.reset_index(drop=True)
        self.initial_balance = float(initial_balance)
        self.trade_size_pct = float(trade_size_pct) 
        
        self.action_space = spaces.Discrete(3) # 0 = Hold, 1 = Buy, 2 = Sell
        self.observation_space = spaces.Box(low=-np.inf, high=np.inf, shape=(5,), dtype=np.float32)
        
        self.current_step = 0
        self.balance = self.initial_balance
        self.shares_held = 0.0 
        self.net_worth = self.initial_balance
        
    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.current_step = 0
        self.balance = self.initial_balance
        self.shares_held = 0.0
        self.net_worth = self.initial_balance
        return self._next_observation(), {}
        
    def _next_observation(self):
        current_price = float(self.df.loc[self.current_step, 'Close'])
        predicted_price = float(self.predictions.loc[self.current_step, 'LSTM_Prediction'])
        regime = float(self.df.loc[self.current_step, 'Regime'])
        
        # ==========================================
        # AI CURRENCY SHOCK FIX: DOMAIN ADAPTATION
        # Project massive INR values down into the USD dimensions 
        # the neural network was originally trained to understand.
        # ==========================================
        start_price = float(self.df['Close'].iloc[0])
        scale_ratio = 10000.0 / self.initial_balance
        price_ratio = 150.0 / start_price if start_price > 0 else 1.0

        ai_balance = self.balance * scale_ratio
        ai_price = current_price * price_ratio
        ai_pred = predicted_price * price_ratio
        
        # Keep the portfolio equity weight exactly the same
        ai_value = (self.shares_held * current_price) * scale_ratio
        ai_shares = ai_value / ai_price if ai_price > 0 else 0.0
        
        return np.array([ai_balance, ai_shares, ai_price, ai_pred, regime], dtype=np.float32)
        
    def step(self, action):
        current_price = float(self.df.loc[self.current_step, 'Close'])
        
        if action == 1: # Buy
            cash_to_invest = self.balance * self.trade_size_pct
            if cash_to_invest > 0:
                shares_bought = cash_to_invest / current_price 
                self.shares_held += shares_bought
                self.balance -= cash_to_invest
                
        elif action == 2: # Sell
            if self.shares_held > 0:
                self.balance += self.shares_held * current_price
                self.shares_held = 0.0
                
        self.current_step += 1
        done = self.current_step >= len(self.df) - 1
        
        new_net_worth = self.balance + (self.shares_held * float(self.df.loc[self.current_step, 'Close']))
        reward = new_net_worth - self.net_worth
        
        # The Lazy Penalty: Punish the AI if it sits in 100% cash forever
        if self.shares_held == 0:
            reward -= 0.50 
            
        self.net_worth = new_net_worth
        obs = self._next_observation()
        info = {'net_worth': self.net_worth}
        
        return obs, float(reward), done, False, info