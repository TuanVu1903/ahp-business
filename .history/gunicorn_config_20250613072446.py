import os

port = os.environ.get('PORT', '5000')
bind = f"0.0.0.0:{port}"
workers = 4
threads = 2
timeout = 120 