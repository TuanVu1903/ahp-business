import os

# Server socket
port = int(os.environ.get('PORT', 8000))
bind = f'0.0.0.0:{port}'

# Worker processes
workers = 4
threads = 2
timeout = 120

# Logging
loglevel = 'info'
accesslog = '-'
errorlog = '-'
capture_output = True 