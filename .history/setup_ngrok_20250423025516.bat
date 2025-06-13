@echo off
echo Please enter your ngrok authtoken:
set /p NGROK_TOKEN=

echo Setting up ngrok...
ngrok config add-authtoken %NGROK_TOKEN%

echo Setup complete! You can now run run_tunnel.bat to start your application with a public URL.
pause 