from app.models import UserRole
from tests.conftest import auth_headers


def test_catalog_lists_only_published_courses(client, make_user, make_course):
    instructor = make_user(UserRole.INSTRUCTOR)
    make_course(instructor, title="Published course")
    make_course(instructor, title="Secret draft", is_published=False)

    response = client.get("/api/courses")

    titles = [course["title"] for course in response.json()["items"]]
    assert titles == ["Published course"]


def test_catalog_search_filter_and_pagination(client, make_user, make_course):
    instructor = make_user(UserRole.INSTRUCTOR)
    make_course(instructor, title="Python Basics", level="beginner")
    make_course(instructor, title="Advanced Python", level="advanced", price=20)
    make_course(instructor, title="Design 101", level="beginner")

    search = client.get("/api/courses", params={"q": "python"}).json()
    beginner_python = client.get("/api/courses", params={"q": "PYTHON", "level": "beginner"}).json()
    paid = client.get("/api/courses", params={"price": "paid"}).json()
    page = client.get("/api/courses", params={"size": 2, "page": 2, "sort": "title"}).json()

    assert search["total"] == 2
    assert [c["title"] for c in beginner_python["items"]] == ["Python Basics"]
    assert [c["title"] for c in paid["items"]] == ["Advanced Python"]
    assert page["pages"] == 2 and [c["title"] for c in page["items"]] == ["Python Basics"]


def test_draft_is_hidden_from_students_but_visible_to_owner(client, make_user, make_course):
    instructor = make_user(UserRole.INSTRUCTOR)
    student = make_user()
    draft = make_course(instructor, is_published=False)

    assert client.get(f"/api/courses/{draft['id']}").status_code == 404
    assert (
        client.get(f"/api/courses/{draft['id']}", headers=auth_headers(student)).status_code == 404
    )
    assert (
        client.get(f"/api/courses/{draft['id']}", headers=auth_headers(instructor)).status_code
        == 200
    )


def test_students_cannot_create_courses(client, make_user, category):
    student = make_user()
    payload = {
        "title": "Hack",
        "summary": "Should not be created.",
        "description": "Students are not allowed to create courses.",
        "category_id": category.id,
    }

    response = client.post("/api/courses", json=payload, headers=auth_headers(student))

    assert response.status_code == 403


def test_only_owner_or_admin_can_edit_and_delete(client, make_user, make_course):
    owner = make_user(UserRole.INSTRUCTOR)
    other = make_user(UserRole.INSTRUCTOR)
    admin = make_user(UserRole.ADMIN)
    course = make_course(owner)
    url = f"/api/courses/{course['id']}"

    forbidden = client.patch(url, json={"title": "Taken over"}, headers=auth_headers(other))
    by_admin = client.patch(url, json={"title": "Edited by admin"}, headers=auth_headers(admin))
    deleted = client.delete(url, headers=auth_headers(owner))

    assert forbidden.status_code == 403
    assert by_admin.json()["title"] == "Edited by admin"
    assert deleted.status_code == 204
    assert client.get(url).status_code == 404


def test_manage_list_scopes_courses_to_instructor(client, make_user, make_course):
    alice = make_user(UserRole.INSTRUCTOR)
    bob = make_user(UserRole.INSTRUCTOR)
    admin = make_user(UserRole.ADMIN)
    make_course(alice, title="Alice course", is_published=False)
    make_course(bob, title="Bob course")

    mine = client.get("/api/courses/manage", headers=auth_headers(alice)).json()
    drafts = client.get(
        "/api/courses/manage", params={"status": "draft"}, headers=auth_headers(admin)
    ).json()

    assert [c["title"] for c in mine["items"]] == ["Alice course"]
    assert [c["title"] for c in drafts["items"]] == ["Alice course"]


def test_lessons_require_enrollment(client, make_user, make_course):
    instructor = make_user(UserRole.INSTRUCTOR)
    student = make_user()
    course = make_course(instructor, lessons=2)
    lesson_url = f"/api/courses/{course['id']}/lessons/{course['lessons'][0]['id']}"

    before = client.get(lesson_url, headers=auth_headers(student))
    client.post(f"/api/courses/{course['id']}/enroll", headers=auth_headers(student))
    after = client.get(lesson_url, headers=auth_headers(student))

    assert course["lesson_count"] == 2
    assert before.status_code == 403
    assert after.status_code == 200 and after.json()["content"]
