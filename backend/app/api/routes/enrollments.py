from fastapi import APIRouter, status

from app.api.deps import DbSession, StaffUser, StudentUser
from app.models import EnrollmentStatus
from app.schemas.enrollment import EnrollmentRead, GradebookEntry, MyEnrollment
from app.services import enrollment_service

router = APIRouter(tags=["Enrollments"])


@router.post(
    "/courses/{course_id}/enroll",
    response_model=EnrollmentRead,
    status_code=status.HTTP_201_CREATED,
)
def enroll(course_id: int, student: StudentUser, db: DbSession):
    return enrollment_service.enroll(db, student, course_id)


@router.delete("/courses/{course_id}/enroll", status_code=status.HTTP_204_NO_CONTENT)
def unenroll(course_id: int, student: StudentUser, db: DbSession) -> None:
    enrollment_service.unenroll(db, student, course_id)


@router.get("/courses/{course_id}/enrollment", response_model=EnrollmentRead)
def read_own_enrollment(course_id: int, student: StudentUser, db: DbSession):
    return enrollment_service.get_own_enrollment(db, student, course_id)


@router.post("/courses/{course_id}/lessons/{lesson_id}/complete", response_model=EnrollmentRead)
def complete_lesson(course_id: int, lesson_id: int, student: StudentUser, db: DbSession):
    return enrollment_service.set_lesson_completed(db, student, course_id, lesson_id, True)


@router.delete("/courses/{course_id}/lessons/{lesson_id}/complete", response_model=EnrollmentRead)
def uncomplete_lesson(course_id: int, lesson_id: int, student: StudentUser, db: DbSession):
    return enrollment_service.set_lesson_completed(db, student, course_id, lesson_id, False)


@router.get("/courses/{course_id}/enrollments", response_model=list[GradebookEntry])
def course_gradebook(course_id: int, user: StaffUser, db: DbSession):
    return enrollment_service.list_course_enrollments(db, user, course_id)


@router.get("/enrollments/me", response_model=list[MyEnrollment])
def my_enrollments(student: StudentUser, db: DbSession, status: EnrollmentStatus | None = None):
    return enrollment_service.list_student_enrollments(db, student, status)
