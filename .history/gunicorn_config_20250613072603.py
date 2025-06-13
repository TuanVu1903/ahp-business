import os

# Server socket
port = os.environ.get('PORT', '5000')
bind = f"0.0.0.0:{port}"

# Worker processes
workers = 4
threads = 2
timeout = 120

# Logging
loglevel = 'debug'
accesslog = '-'
errorlog = '-'
capture_output = True 