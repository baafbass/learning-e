from app.models import UserRole
from tests.conftest import auth_headers


def _complete(client, student, course, index):
    lesson_id = course["lessons"][index]["id"]
    return client.post(
        f"/api/courses/{course['id']}/lessons/{lesson_id}/complete", headers=auth_headers(student)
    )


def test_enroll_once_and_unenroll(client, make_user, make_course):
    student = make_user()
    course = make_course(make_user(UserRole.INSTRUCTOR), lessons=1)
    url = f"/api/courses/{course['id']}/enroll"

    first = client.post(url, headers=auth_headers(student))
    second = client.post(url, headers=auth_headers(student))
    removed = client.delete(url, headers=auth_headers(student))

    assert first.status_code == 201
    assert first.json()["status"] == "in_progress" and first.json()["progress"] == 0
    assert second.status_code == 409
    assert removed.status_code == 204


def test_progress_and_completion_follow_lessons(client, make_user, make_course):
    instructor = make_user(UserRole.INSTRUCTOR)
    student = make_user()
    course = make_course(instructor, lessons=4)
    client.post(f"/api/courses/{course['id']}/enroll", headers=auth_headers(student))

    one = _complete(client, student, course, 0).json()
    for index in (1, 2, 3):
        done = _complete(client, student, course, index).json()
    lesson_id = course["lessons"][3]["id"]
    undone = client.delete(
        f"/api/courses/{course['id']}/lessons/{lesson_id}/complete", headers=auth_headers(student)
    ).json()

    assert one["progress"] == 25 and one["next_lesson_id"] == course["lessons"][1]["id"]
    assert done["progress"] == 100 and done["status"] == "completed" and done["completed_at"]
    assert undone["status"] == "in_progress" and undone["completed_at"] is None


def test_adding_a_lesson_reopens_completed_enrollments(client, make_user, make_course):
    instructor = make_user(UserRole.INSTRUCTOR)
    student = make_user()
    course = make_course(instructor, lessons=1)
    client.post(f"/api/courses/{course['id']}/enroll", headers=auth_headers(student))
    _complete(client, student, course, 0)

    client.post(
        f"/api/courses/{course['id']}/lessons",
        json={"title": "Bonus lesson", "content": "More content to learn.", "position": 2},
        headers=auth_headers(instructor),
    )
    enrollment = client.get(
        f"/api/courses/{course['id']}/enrollment", headers=auth_headers(student)
    ).json()

    assert enrollment["progress"] == 50 and enrollment["status"] == "in_progress"


def test_my_enrollments_filter_by_status(client, make_user, make_course):
    instructor = make_user(UserRole.INSTRUCTOR)
    student = make_user()
    finished = make_course(instructor, lessons=1, title="Finished course")
    ongoing = make_course(instructor, lessons=2, title="Ongoing course")
    for course in (finished, ongoing):
        client.post(f"/api/courses/{course['id']}/enroll", headers=auth_headers(student))
    _complete(client, student, finished, 0)

    completed = client.get(
        "/api/enrollments/me", params={"status": "completed"}, headers=auth_headers(student)
    ).json()
    everything = client.get("/api/enrollments/me", headers=auth_headers(student)).json()

    assert [e["course"]["title"] for e in completed] == ["Finished course"]
    assert len(everything) == 2


def test_grades_lifecycle_and_permissions(client, make_user, make_course):
    instructor = make_user(UserRole.INSTRUCTOR)
    outsider = make_user(UserRole.INSTRUCTOR)
    student = make_user()
    course = make_course(instructor, lessons=1)
    enrollment = client.post(
        f"/api/courses/{course['id']}/enroll", headers=auth_headers(student)
    ).json()
    grades_url = f"/api/enrollments/{enrollment['id']}/grades"

    too_high = client.post(
        grades_url, json={"title": "Quiz", "score": 120}, headers=auth_headers(instructor)
    )
    forbidden = client.post(
        grades_url, json={"title": "Quiz", "score": 50}, headers=auth_headers(outsider)
    )
    grade = client.post(
        grades_url,
        json={"title": "Quiz", "score": 18, "max_score": 20},
        headers=auth_headers(instructor),
    ).json()
    updated = client.patch(
        f"/api/grades/{grade['id']}", json={"score": 15}, headers=auth_headers(instructor)
    ).json()
    gradebook = client.get(
        f"/api/courses/{course['id']}/enrollments", headers=auth_headers(instructor)
    ).json()

    assert too_high.status_code == 422
    assert too_high.json()["detail"].endswith("Score cannot exceed the maximum score")
    assert forbidden.status_code == 403
    assert grade["percentage"] == 90 and grade["letter"] == "A"
    assert updated["percentage"] == 75 and updated["letter"] == "C"
    assert gradebook[0]["student"]["id"] == student.id
    assert gradebook[0]["average_score"] == 75

    deleted = client.delete(f"/api/grades/{grade['id']}", headers=auth_headers(instructor))
    assert deleted.status_code == 204


def test_deleting_course_removes_enrollments(client, make_user, make_course):
    instructor = make_user(UserRole.INSTRUCTOR)
    student = make_user()
    course = make_course(instructor, lessons=2)
    client.post(f"/api/courses/{course['id']}/enroll", headers=auth_headers(student))
    _complete(client, student, course, 0)

    client.delete(f"/api/courses/{course['id']}", headers=auth_headers(instructor))

    assert client.get("/api/enrollments/me", headers=auth_headers(student)).json() == []
