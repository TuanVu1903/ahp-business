import os

bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"
workers = 1
threads = 2
timeout = 0
worker_class = 'sync'
loglevel = 'info'
accesslog = '-'
errorlog = '-' 