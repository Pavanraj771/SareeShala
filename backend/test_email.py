import smtplib

try:
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login('sareeshala@gmail.com', 'sareeshala@123')
    print("Login successful!")
    server.quit()
except Exception as e:
    print(f"Failed to login: {e}")
