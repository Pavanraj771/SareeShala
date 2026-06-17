"""Quick test to verify Gmail SMTP credentials work."""
import smtplib

EMAIL = 'sareeshala@gmail.com'
APP_PASSWORD = 'uotqgxunaqklwlgx'

try:
    print(f"Connecting to smtp.gmail.com:587 ...")
    server = smtplib.SMTP('smtp.gmail.com', 587, timeout=10)
    server.starttls()
    print("TLS established. Attempting login...")
    server.login(EMAIL, APP_PASSWORD)
    print("✅ Login SUCCESSFUL! Gmail credentials are valid.")
    server.quit()
except smtplib.SMTPAuthenticationError as e:
    print(f"❌ Authentication FAILED: {e}")
    print("\nThis means the app password is INVALID or REVOKED.")
    print("Go to https://myaccount.google.com/apppasswords to generate a new one.")
except Exception as e:
    print(f"❌ Connection error: {type(e).__name__}: {e}")
