import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

def send_email(to_email: str, subject: str, body_text: str) -> bool:
    """
    Sends an email using the SMTP settings configured in Settings.
    Logs to console as fallback if SMTP settings are missing.
    """
    # Always print to the console as a backup developer log
    print(f"==================================================")
    print(f"[OUTGOING EMAIL]")
    print(f"To: {to_email}")
    print(f"Subject: {subject}")
    print(f"Body: {body_text}")
    print(f"==================================================")

    # Check if SMTP is configured
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("[EMAIL MOCK] SMTP credentials are not configured. Real email was not sent.")
        return False

    try:
        # Create standard MIME email
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_FROM
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body_text, 'plain'))

        # Connect to SMTP server
        # Port 465 uses SSL directly, other ports (like 587) use STARTTLS
        if settings.SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
            server.starttls()
            
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM, to_email, msg.as_string())
        server.quit()
        
        print(f"[EMAIL SUCCESS] Successfully sent email to {to_email}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email to {to_email}: {e}")
        return False
