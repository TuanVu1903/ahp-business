@echo off
echo Installing required packages...
pip install -r requirements.txt

echo Starting application with tunnel...
python run_with_tunnel.py

pause 