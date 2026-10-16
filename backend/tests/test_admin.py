from app.models import UserRole
from tests.conftest import auth_headers


def test_admin_endpoints_reject_non_admins(client, make_user):
    instructor = make_user(UserRole.INSTRUCTOR)

    assert client.get("/api/users", headers=auth_headers(instructor)).status_code == 403
    assert client.get("/api/admin/stats", headers=auth_headers(instructor)).status_code == 403


def test_admin_manages_users_but_not_self(client, make_user):
    admin = make_user(UserRole.ADMIN)
    student = make_user(full_name="Maria Garcia")
    headers = auth_headers(admin)

    search = client.get("/api/users", params={"q": "maria", "role": "student"}, headers=headers)
    promoted = client.patch(
        f"/api/users/{student.id}", json={"role": "instructor"}, headers=headers
    )
    self_demote = client.patch(f"/api/users/{admin.id}", json={"role": "student"}, headers=headers)
    self_delete = client.delete(f"/api/users/{admin.id}", headers=headers)
    deleted = client.delete(f"/api/users/{student.id}", headers=headers)

    assert [u["full_name"] for u in search.json()["items"]] == ["Maria Garcia"]
    assert promoted.json()["role"] == "instructor"
    assert self_demote.status_code == 400
    assert self_delete.status_code == 400
    assert deleted.status_code == 204


def test_category_crud_and_in_use_protection(client, make_user, make_course, category):
    admin = make_user(UserRole.ADMIN)
    headers = auth_headers(admin)
    make_course(make_user(UserRole.INSTRUCTOR))

    created = client.post(
        "/api/categories", json={"name": "Design", "icon": "palette"}, headers=headers
    )
    duplicate = client.post("/api/categories", json={"name": "design"}, headers=headers)
    in_use = client.delete(f"/api/categories/{category.id}", headers=headers)
    removed = client.delete(f"/api/categories/{created.json()['id']}", headers=headers)
    listing = client.get("/api/categories").json()

    assert created.status_code == 201
    assert duplicate.status_code == 409
    assert (
        in_use.status_code == 409 and in_use.json()["detail"] == "Category is used by 1 course(s)"
    )
    assert removed.status_code == 204
    assert listing[0]["course_count"] == 1


def test_admin_stats_and_contact_messages(client, make_user, make_course):
    admin = make_user(UserRole.ADMIN)
    student = make_user()
    course = make_course(make_user(UserRole.INSTRUCTOR), lessons=1)
    client.post(f"/api/courses/{course['id']}/enroll", headers=auth_headers(student))
    client.post(
        "/api/contact",
        json={
            "name": "Visitor",
            "email": "v@test.dev",
            "subject": "Hello",
            "message": "A friendly message.",
        },
    )

    stats = client.get("/api/admin/stats", headers=auth_headers(admin)).json()
    messages = client.get("/api/contact", headers=auth_headers(admin)).json()
    marked = client.patch(
        f"/api/contact/{messages['items'][0]['id']}",
        json={"is_read": True},
        headers=auth_headers(admin),
    )

    assert stats["students"] == 1 and stats["instructors"] == 1 and stats["admins"] == 1
    assert stats["enrollments_in_progress"] == 1 and stats["unread_messages"] == 1
    assert stats["top_courses"][0]["id"] == course["id"]
    assert marked.json()["is_read"] is True


def test_students_are_scoped_to_instructor(client, make_user, make_course):
    alice = make_user(UserRole.INSTRUCTOR)
    bob = make_user(UserRole.INSTRUCTOR)
    admin = make_user(UserRole.ADMIN)
    student_a = make_user(full_name="Student A")
    make_user(full_name="Student B")
    course = make_course(alice, lessons=1)
    client.post(f"/api/courses/{course['id']}/enroll", headers=auth_headers(student_a))

    alice_view = client.get("/api/students", headers=auth_headers(alice)).json()
    bob_view = client.get("/api/students", headers=auth_headers(bob)).json()
    admin_view = client.get("/api/students", headers=auth_headers(admin)).json()
    detail = client.get(f"/api/students/{student_a.id}", headers=auth_headers(alice)).json()

    assert [s["full_name"] for s in alice_view["items"]] == ["Student A"]
    assert bob_view["total"] == 0
    assert admin_view["total"] == 2
    assert (
        detail["enrollment_count"] == 1 and detail["enrollments"][0]["course"]["id"] == course["id"]
    )
