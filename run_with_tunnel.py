from app import app
from pyngrok import ngrok
import os

# Set default port
port = int(os.environ.get("PORT", 5000))

# Open ngrok tunnel
public_url = ngrok.connect(port).public_url
print(f" * ngrok tunnel \"{public_url}\" -> http://127.0.0.1:{port}")

# Update any base URLs or callback URLs for the app
app.config["BASE_URL"] = public_url

# Run Flask app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=port) 