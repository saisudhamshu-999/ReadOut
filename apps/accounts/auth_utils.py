import datetime
import jwt
from django.conf import settings
from .models import User

def generate_jwt_token(user: User) -> str:
    payload = {
        'id': user.id,
        'email': user.email,
        'fullName': user.full_name,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24),
        'iat': datetime.datetime.now(datetime.timezone.utc)
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')

def get_user_from_token(token: str):
    if not token:
        return None
    try:
        if token.startswith('Bearer '):
            token = token.split(' ', 1)[1].strip()
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('id')
        if not user_id:
            return None
        return User.objects.filter(id=user_id, is_active=True).first()
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

def get_current_user(request):
    auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
    if not auth_header:
        return None
    return get_user_from_token(auth_header)
