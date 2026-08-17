import bcrypt
import os
import secrets
import random
import requests
from urllib.parse import urlencode
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from dotenv import load_dotenv

from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserUpdate, ChangePassword, UserResponse, Token

load_dotenv()

SECRET_KEY = "foodmap-secret-key-doi-sau-nay"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")
FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID", "")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET", "")
FACEBOOK_REDIRECT_URI = os.getenv("FACEBOOK_REDIRECT_URI", "http://localhost:8000/api/auth/facebook/callback")

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

# In-memory verification codes (use Redis/DB in production)
verification_codes: dict[str, dict] = {}
reset_codes: dict[str, dict] = {}


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token khong hop le")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token khong hop le")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Nguoi dung khong ton tai")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.vaitro != "admin":
        raise HTTPException(status_code=403, detail="Yeu cau quyen admin")
    return user


def generate_random_password() -> str:
    return secrets.token_urlsafe(32)


# ─── Google OAuth ─────────────────────────────────────────────────


@router.get("/google/redirect")
def google_redirect():
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(url)


@router.get("/google/callback")
def google_callback(code: str, db: Session = Depends(get_db)):
    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    token_resp = requests.post("https://oauth2.googleapis.com/token", data=token_data, timeout=10)
    token_json = token_resp.json()

    if "access_token" not in token_json:
        raise HTTPException(status_code=400, detail="Google xac thuc that bai")

    headers = {"Authorization": f"Bearer {token_json['access_token']}"}
    user_resp = requests.get("https://www.googleapis.com/oauth2/v2/userinfo", headers=headers, timeout=10)
    google_user = user_resp.json()

    email = google_user.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Khong lay duoc email tu Google")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            ten=google_user.get("name", email.split("@")[0]),
            email=email,
            matkhau=hash_password(generate_random_password()),
            vaitro="user",
            avatar=google_user.get("picture"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_token({"id": user.id, "vaitro": user.vaitro})

    html = f"""<!DOCTYPE html>
<html><body><script>
if (window.opener) {{
    window.opener.postMessage({{
        type: 'social-auth',
        provider: 'google',
        access_token: '{token}',
        user: {UserResponse.model_validate(user).model_dump_json()}
    }}, '{FRONTEND_URL}');
    window.close();
}} else {{
    window.location.href = '{FRONTEND_URL}/login?token={token}';
}}
</script></body></html>"""
    return HTMLResponse(content=html)


# ─── Facebook OAuth ───────────────────────────────────────────────


@router.get("/facebook/redirect")
def facebook_redirect():
    params = {
        "client_id": FACEBOOK_APP_ID,
        "redirect_uri": FACEBOOK_REDIRECT_URI,
        "response_type": "code",
        "scope": "public_profile",
    }
    url = f"https://www.facebook.com/v22.0/dialog/oauth?{urlencode(params)}"
    return RedirectResponse(url)


@router.get("/facebook/callback")
def facebook_callback(code: str, db: Session = Depends(get_db)):
    token_data = {
        "client_id": FACEBOOK_APP_ID,
        "client_secret": FACEBOOK_APP_SECRET,
        "redirect_uri": FACEBOOK_REDIRECT_URI,
        "code": code,
    }
    token_resp = requests.get("https://graph.facebook.com/v22.0/oauth/access_token", params=token_data, timeout=10)
    token_json = token_resp.json()

    if "access_token" not in token_json:
        raise HTTPException(status_code=400, detail=f"Facebook xac thuc that bai: {token_json.get('error', {}).get('message', token_json)}")

    access_token = token_json["access_token"]
    fields = "id,name,email,picture"
    info_resp = requests.get(
        f"https://graph.facebook.com/me?fields={fields}&access_token={access_token}",
        timeout=10,
    )
    fb_user = info_resp.json()

    email = fb_user.get("email", f"{fb_user['id']}@facebook.com")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            ten=fb_user.get("name", email.split("@")[0]),
            email=email,
            matkhau=hash_password(generate_random_password()),
            vaitro="user",
            avatar=fb_user.get("picture", {}).get("data", {}).get("url") if isinstance(fb_user.get("picture"), dict) else None,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_token({"id": user.id, "vaitro": user.vaitro})

    html = f"""<!DOCTYPE html>
<html><body><script>
if (window.opener) {{
    window.opener.postMessage({{
        type: 'social-auth',
        provider: 'facebook',
        access_token: '{token}',
        user: {UserResponse.model_validate(user).model_dump_json()}
    }}, '{FRONTEND_URL}');
    window.close();
}} else {{
    window.location.href = '{FRONTEND_URL}/login?token={token}';
}}
</script></body></html>"""
    return HTMLResponse(content=html)


# ─── Email Verification ───────────────────────────────────────────


def build_email_html(title: str, message: str, code: str, note: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08);">
          <tr>
            <td align="center" style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px 24px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 14px;">
                <tr>
                  <td width="28" height="28" align="center" style="width:28px;height:28px;padding:14px;border-radius:16px;background-color:#ffffff;font-size:28px;line-height:28px;">🍜</td>
                </tr>
              </table>
              <div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">Cẩm nang du lịch</div>
              <div style="color:#bfdbfe;font-size:13px;margin-top:4px;">Khám phá ẩm thực Việt Nam</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px;">
              <h1 style="margin:0 0 8px;font-size:18px;color:#0f172a;">{title}</h1>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#475569;">{message}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 32px;">
              <div style="display:inline-block;background-color:#eff6ff;border:2px dashed #60a5fa;border-radius:12px;padding:20px 40px;">
                <div style="font-size:12px;color:#64748b;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Mã xác thực của bạn</div>
                <div style="font-size:34px;font-weight:800;letter-spacing:12px;color:#1d4ed8;">{code}</div>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 32px 32px;">
              <p style="margin:0;font-size:13px;color:#94a3b8;">{note}</p>
              <p style="margin:16px 0 0;font-size:12px;color:#cbd5e1;">Nếu bạn không thực hiện thao tác này, vui lòng bỏ qua email này.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc;padding:20px 32px;text-align:center;">
              <div style="font-size:12px;color:#94a3b8;">© {datetime.now().year} Cẩm nang du lịch — Cam Nang Du Lich</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def send_email_brevo(api_key, from_email, to_email, subject, body, html):
    requests.post(
        "https://api.brevo.com/v3/smtp/email",
        headers={
            "api-key": api_key,
            "Content-Type": "application/json",
        },
        json={
            "sender": {"email": from_email},
            "to": [{"email": to_email}],
            "subject": subject,
            "textContent": body,
            "htmlContent": html,
        },
        timeout=15,
    )


@router.post("/send-verification-code")
def send_verification_code(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Thieu email")

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email da duoc dang ky")

    code = f"{random.randint(100000, 999999)}"
    verification_codes[email] = {
        "code": code,
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat(),
    }

    subject = "Xác thực email - Cẩm nang du lịch"
    body = f"Ma xac thuc cua ban la: {code}\nMa co hieu luc trong 5 phut."
    html = build_email_html(
        title="Xác thực email",
        message=f"Chào bạn,<br><br>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Cẩm nang du lịch</strong>. Vui lòng dùng mã dưới đây để xác thực email của bạn.",
        code=code,
        note="Mã có hiệu lực trong 5 phút.",
    )

    brevo_key = os.getenv("BREVO_API_KEY", "")
    from_email = os.getenv("EMAIL_FROM", "")

    if brevo_key and from_email:
        try:
            send_email_brevo(brevo_key, from_email, email, subject, body, html)
            return {"message": f"Ma xac thuc da duoc gui den {email}"}
        except Exception as e:
            verification_codes.pop(email, None)
            raise HTTPException(status_code=500, detail=f"Gui email that bai: {str(e)}")

    verification_codes.pop(email, None)
    raise HTTPException(
        status_code=500,
        detail="Email chua duoc cau hinh. Vui long thu lai sau.",
    )


@router.post("/verify-code")
def verify_code(data: dict):
    email = data.get("email")
    code = data.get("code")
    if not email or not code:
        raise HTTPException(status_code=400, detail="Thieu email hoac ma xac thuc")

    stored = verification_codes.get(email)
    if not stored:
        raise HTTPException(status_code=400, detail="Khong tim thay ma xac thuc cho email nay")

    expires_at = datetime.fromisoformat(stored["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        verification_codes.pop(email, None)
        raise HTTPException(status_code=400, detail="Ma xac thuc da het han")

    if stored["code"] != code:
        raise HTTPException(status_code=400, detail="Ma xac thuc khong dung")

    verification_codes.pop(email, None)
    return {"message": "Xac thuc email thanh cong"}


# ─── Forgot Password ──────────────────────────────────────────────


@router.post("/forgot-password")
def forgot_password(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Thieu email")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Email khong ton tai trong he thong")

    code = f"{random.randint(100000, 999999)}"
    reset_codes[email] = {
        "code": code,
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat(),
    }

    subject = "Đặt lại mật khẩu - Cẩm nang du lịch"
    body = f"Ma dat lai mat khau cua ban la: {code}\nMa co hieu luc trong 5 phut."
    html = build_email_html(
        title="Đặt lại mật khẩu",
        message=f"Chào bạn,<br><br>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>{email}</strong> tại <strong>Cẩm nang du lịch</strong>. Vui lòng dùng mã dưới đây để đặt lại mật khẩu của bạn.",
        code=code,
        note="Mã có hiệu lực trong 5 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.",
    )

    brevo_key = os.getenv("BREVO_API_KEY", "")
    from_email = os.getenv("EMAIL_FROM", "")

    if brevo_key and from_email:
        try:
            send_email_brevo(brevo_key, from_email, email, subject, body, html)
            return {"message": f"Ma dat lai mat khau da duoc gui den {email}"}
        except Exception as e:
            reset_codes.pop(email, None)
            raise HTTPException(status_code=500, detail=f"Gui email that bai: {str(e)}")

    reset_codes.pop(email, None)
    raise HTTPException(
        status_code=500,
        detail="Email chua duoc cau hinh. Vui long thu lai sau.",
    )


@router.post("/reset-password")
def reset_password(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    code = data.get("code")
    matkhau_moi = data.get("matkhau_moi")
    if not email or not code or not matkhau_moi:
        raise HTTPException(status_code=400, detail="Thieu email, ma xac thuc hoac mat khau moi")
    if len(matkhau_moi) < 6:
        raise HTTPException(status_code=400, detail="Mat khau phai co it nhat 6 ky tu")

    stored = reset_codes.get(email)
    if not stored:
        raise HTTPException(status_code=400, detail="Khong tim thay ma dat lai mat khau cho email nay")

    expires_at = datetime.fromisoformat(stored["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        reset_codes.pop(email, None)
        raise HTTPException(status_code=400, detail="Ma xac thuc da het han")

    if stored["code"] != code:
        raise HTTPException(status_code=400, detail="Ma xac thuc khong dung")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Nguoi dung khong ton tai")

    user.matkhau = hash_password(matkhau_moi)
    reset_codes.pop(email, None)
    db.commit()
    return {"message": "Mat khau da duoc dat lai thanh cong"}


# ─── Existing routes ──────────────────────────────────────────────


@router.post("/register", response_model=Token)
def register(data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email da duoc dang ky")

    user = User(
        ten=data.ten,
        email=data.email,
        matkhau=hash_password(data.matkhau),
        vaitro="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token({"id": user.id, "vaitro": user.vaitro})
    return Token(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.matkhau, user.matkhau):
        raise HTTPException(status_code=401, detail="Sai email hoac mat khau")

    token = create_token({"id": user.id, "vaitro": user.vaitro})
    return Token(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.put("/me", response_model=UserResponse)
def update_me(data: UserUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if data.ten is not None:
        user.ten = data.ten
    if data.email is not None and data.email != user.email:
        existing = db.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email da duoc su dung")
        user.email = data.email
    if data.avatar is not None:
        user.avatar = data.avatar
    db.commit()
    db.refresh(user)
    return user


@router.put("/me/password")
def change_password(data: ChangePassword, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not verify_password(data.matkhau_cu, user.matkhau):
        raise HTTPException(status_code=400, detail="Mat khau cu khong dung")
    user.matkhau = hash_password(data.matkhau_moi)
    db.commit()
    return {"message": "Mat khau da duoc thay doi"}


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return user
