from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv
from pathlib import Path
from src.trading_env import QuantitativeTradingEnv

PROJECT_ROOT = Path(__file__).resolve().parents[1]
PPO_PATH = PROJECT_ROOT / 'elite_quant_agent'

def train_rl_agent(train_df, train_preds, total_timesteps=20000):
    print("\n========== INITIATING RL TRAINING ==========")
    # Wrap the environment
    env = DummyVecEnv([lambda: QuantitativeTradingEnv(train_df, train_preds)])
    
    # Initialize the PPO Brain
    model = PPO("MlpPolicy", env, verbose=0)
    print(f"Training PPO Agent for {total_timesteps} timesteps...")
    model.learn(total_timesteps=total_timesteps)
    
    # Save the trained brain
    model.save(str(PPO_PATH))
    print("Agent saved as 'elite_quant_agent.zip'")
    return model

def backtest_agent(test_df, test_preds):
    print("\n========== INITIATING LIVE BACKTEST ==========")
    env = DummyVecEnv([lambda: QuantitativeTradingEnv(test_df, test_preds)])
    model = PPO.load(str(PPO_PATH))
    
    obs = env.reset()
    done = False
    
    while not done:
        # deterministic=True is the golden rule for live trading. No random exploration.
        action, _states = model.predict(obs, deterministic=True)
        obs, reward, done, info = env.step(action)
        done = done[0] # Unpack array from DummyVecEnv
        
    final_net_worth = info[0]['net_worth']
    initial_balance = 10000
    roi = ((final_net_worth - initial_balance) / initial_balance) * 100
    
    print(f"Backtest Complete.")
    print(f"Starting Balance: ${initial_balance}")
    print(f"Final Portfolio Value: ${final_net_worth:.2f}")
    print(f"Return on Investment (ROI): {roi:.2f}%")