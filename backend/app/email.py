import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

def send_email(to_email: str, subject: str, body_text: str) -> bool:
    """
    Sends an email using the Resend HTTP API (if configured) or SMTP settings.
    Logs to console as fallback if credentials are missing.
    """
    # Always print to the console as a backup developer log
    print(f"==================================================")
    print(f"[OUTGOING EMAIL]")
    print(f"To: {to_email}")
    print(f"Subject: {subject}")
    print(f"Body: {body_text}")
    print(f"==================================================")

    # 1. Try sending via Resend HTTP API (Port 443 - Bypasses Render port blocks)
    if settings.RESEND_API_KEY:
        try:
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                "Content-Type": "application/json"
            }
            # Resend onboarding fallback
            from_addr = settings.SMTP_FROM
            if not from_addr or "yourdomain.com" in from_addr or "startupinsight.ai" in from_addr:
                from_addr = "onboarding@resend.dev"
                
            payload = {
                "from": from_addr,
                "to": to_email,
                "subject": subject,
                "text": body_text
            }
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            if response.status_code in [200, 201]:
                print(f"[EMAIL SUCCESS] Successfully sent email via Resend API to {to_email}")
                return True
            else:
                print(f"[EMAIL ERROR] Failed to send email via Resend API: {response.text}")
        except Exception as e:
            print(f"[EMAIL EXCEPTION] Error calling Resend API: {e}")

    # 2. Try sending via standard SMTP
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
