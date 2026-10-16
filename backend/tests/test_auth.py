from app.models import UserRole
from tests.conftest import PASSWORD, auth_headers

REGISTRATION = {
    "full_name": "Ada Lovelace",
    "email": "Ada@Example.com",
    "password": "Analytical1",
    "role": "student",
}


def test_register_returns_token_and_lowercases_email(client):
    response = client.post("/api/auth/register", json=REGISTRATION)

    assert response.status_code == 201
    body = response.json()
    assert body["access_token"]
    assert body["user"]["email"] == "ada@example.com"
    assert body["user"]["role"] == "student"


def test_register_rejects_duplicate_email(client):
    client.post("/api/auth/register", json=REGISTRATION)

    response = client.post("/api/auth/register", json={**REGISTRATION, "email": "ADA@example.com"})

    assert response.status_code == 409
    assert response.json()["detail"] == "Email is already registered"


def test_register_rejects_weak_password(client):
    response = client.post("/api/auth/register", json={**REGISTRATION, "password": "onlyletters"})

    assert response.status_code == 422
    assert "letter and one digit" in response.json()["detail"]


def test_register_cannot_choose_admin_role(client):
    response = client.post("/api/auth/register", json={**REGISTRATION, "role": "admin"})

    assert response.status_code == 422


def test_login_with_valid_and_invalid_credentials(client, make_user):
    user = make_user()

    ok = client.post("/api/auth/login", json={"email": user.email, "password": PASSWORD})
    wrong = client.post("/api/auth/login", json={"email": user.email, "password": "Wrong1234"})

    assert ok.status_code == 200
    assert ok.json()["user"]["id"] == user.id
    assert wrong.status_code == 401
    assert wrong.json()["detail"] == "Invalid email or password"


def test_deactivated_user_cannot_log_in_or_use_token(client, make_user):
    user = make_user(is_active=False)

    login = client.post("/api/auth/login", json={"email": user.email, "password": PASSWORD})
    me = client.get("/api/auth/me", headers=auth_headers(user))

    assert login.status_code == 403
    assert me.status_code == 403


def test_protected_endpoint_requires_valid_token(client):
    assert client.get("/api/auth/me").status_code == 401
    bad = client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-token"})
    assert bad.status_code == 401


def test_update_profile_and_change_password(client, make_user):
    user = make_user(UserRole.INSTRUCTOR)
    headers = auth_headers(user)

    profile = client.patch(
        "/api/auth/me", json={"full_name": "New Name", "bio": "Hi"}, headers=headers
    )
    wrong = client.post(
        "/api/auth/change-password",
        json={"current_password": "Nope1234", "new_password": "Brand1New"},
        headers=headers,
    )
    changed = client.post(
        "/api/auth/change-password",
        json={"current_password": PASSWORD, "new_password": "Brand1New"},
        headers=headers,
    )
    relogin = client.post("/api/auth/login", json={"email": user.email, "password": "Brand1New"})

    assert profile.json()["full_name"] == "New Name"
    assert wrong.status_code == 400
    assert changed.status_code == 204
    assert relogin.status_code == 200
