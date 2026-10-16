"""Demo content used by `python -m app.db.init_db --seed`."""

DEMO_PASSWORDS = {
    "admin": "Admin@123",
    "instructor": "Instructor@123",
    "student": "Student@123",
}

ADMIN = {"full_name": "Platform Admin", "email": "admin@learnhub.dev"}

INSTRUCTORS = [
    {
        "key": "sarah",
        "full_name": "Sarah Johnson",
        "email": "sarah.johnson@learnhub.dev",
        "bio": "Senior frontend engineer with 12 years of experience building web products.",
    },
    {
        "key": "david",
        "full_name": "David Chen",
        "email": "david.chen@learnhub.dev",
        "bio": "Data scientist and former university lecturer in statistics.",
    },
    {
        "key": "amara",
        "full_name": "Amara Okafor",
        "email": "amara.okafor@learnhub.dev",
        "bio": "Product designer and cloud architect who loves teaching practical skills.",
    },
]

STUDENTS = [
    {"full_name": "Yasmine Haddad", "email": "yasmine.haddad@learnhub.dev"},
    {"full_name": "Maria Garcia", "email": "maria.garcia@learnhub.dev"},
    {"full_name": "Lucas Martin", "email": "lucas.martin@learnhub.dev"},
    {"full_name": "Aisha Bello", "email": "aisha.bello@learnhub.dev"},
    {"full_name": "Kofi Mensah", "email": "kofi.mensah@learnhub.dev"},
    {"full_name": "Emma Wilson", "email": "emma.wilson@learnhub.dev"},
]

CATEGORIES = [
    {
        "name": "Web Development",
        "icon": "code",
        "description": "HTML, CSS, JavaScript and modern frameworks.",
    },
    {
        "name": "Data Science",
        "icon": "analytics",
        "description": "Statistics, Python, machine learning and visualization.",
    },
    {"name": "Design", "icon": "palette", "description": "UI, UX and visual design fundamentals."},
    {
        "name": "Business",
        "icon": "business_center",
        "description": "Management, marketing and entrepreneurship.",
    },
    {
        "name": "Mobile Development",
        "icon": "smartphone",
        "description": "Native and cross-platform mobile apps.",
    },
    {
        "name": "Cloud & DevOps",
        "icon": "cloud",
        "description": "Cloud platforms, containers and automation.",
    },
    {
        "name": "Cybersecurity",
        "icon": "shield",
        "description": "Protecting systems, networks and data.",
    },
    {
        "name": "Languages",
        "icon": "translate",
        "description": "Learn to speak and write new languages.",
    },
]

COURSES = [
    {
        "title": "Modern Angular from Scratch",
        "summary": "Build fast, maintainable single-page apps with standalone components and signals.",
        "category": "Web Development",
        "instructor": "sarah",
        "level": "beginner",
        "price": 0,
        "duration_hours": 12,
        "outcomes": [
            "Create standalone components and templates",
            "Manage state with signals",
            "Route between lazy-loaded pages",
            "Call a REST API with HttpClient",
        ],
        "lessons": [
            "Setting up the Angular CLI",
            "Components and templates",
            "Signals and change detection",
            "Routing and lazy loading",
            "Forms and validation",
            "Talking to a REST API",
        ],
    },
    {
        "title": "FastAPI for Production APIs",
        "summary": "Design, secure and test high-performance Python REST APIs with FastAPI.",
        "category": "Web Development",
        "instructor": "sarah",
        "level": "intermediate",
        "price": 49,
        "duration_hours": 10,
        "outcomes": [
            "Structure a FastAPI project in layers",
            "Validate data with Pydantic",
            "Secure endpoints with JWT",
            "Write automated API tests",
        ],
        "lessons": [
            "Why FastAPI",
            "Path operations and Pydantic models",
            "Databases with SQLAlchemy",
            "Authentication with JWT",
            "Testing with pytest",
        ],
    },
    {
        "title": "Responsive CSS Layouts",
        "summary": "Master Flexbox, Grid and modern CSS to build layouts that work on every screen.",
        "category": "Web Development",
        "instructor": "sarah",
        "level": "beginner",
        "price": 0,
        "duration_hours": 6,
        "outcomes": ["Use Flexbox confidently", "Design with CSS Grid", "Write mobile-first CSS"],
        "lessons": ["The box model", "Flexbox in practice", "CSS Grid", "Media queries"],
    },
    {
        "title": "Python for Data Analysis",
        "summary": "Clean, explore and visualize real datasets with pandas and matplotlib.",
        "category": "Data Science",
        "instructor": "david",
        "level": "beginner",
        "price": 0,
        "duration_hours": 14,
        "outcomes": [
            "Load and clean data with pandas",
            "Summarize data with group-by",
            "Plot insights with matplotlib",
        ],
        "lessons": [
            "Python refresher",
            "pandas DataFrames",
            "Cleaning messy data",
            "Grouping and aggregation",
            "Visualizing results",
        ],
    },
    {
        "title": "Machine Learning Foundations",
        "summary": "Understand and apply core machine learning algorithms with scikit-learn.",
        "category": "Data Science",
        "instructor": "david",
        "level": "intermediate",
        "price": 79,
        "duration_hours": 18,
        "outcomes": [
            "Frame problems as supervised learning",
            "Train and evaluate models",
            "Avoid overfitting",
        ],
        "lessons": [
            "What is machine learning?",
            "Linear regression",
            "Classification",
            "Model evaluation",
            "Feature engineering",
            "Your first ML project",
        ],
    },
    {
        "title": "Statistics for Decision Making",
        "summary": "Use probability and statistical tests to make confident, data-driven decisions.",
        "category": "Data Science",
        "instructor": "david",
        "level": "advanced",
        "price": 59,
        "duration_hours": 9,
        "outcomes": [
            "Reason with probability",
            "Run hypothesis tests",
            "Interpret confidence intervals",
        ],
        "lessons": ["Probability basics", "Distributions", "Hypothesis testing", "A/B testing"],
    },
    {
        "title": "UI Design Essentials",
        "summary": "Learn typography, color, spacing and layout to design clean interfaces.",
        "category": "Design",
        "instructor": "amara",
        "level": "beginner",
        "price": 0,
        "duration_hours": 7,
        "outcomes": [
            "Choose type and color",
            "Apply spacing systems",
            "Design accessible interfaces",
        ],
        "lessons": [
            "Design principles",
            "Typography",
            "Color theory",
            "Layout and spacing",
            "Accessibility",
        ],
    },
    {
        "title": "UX Research Methods",
        "summary": "Plan interviews, run usability tests and turn findings into product decisions.",
        "category": "Design",
        "instructor": "amara",
        "level": "intermediate",
        "price": 39,
        "duration_hours": 8,
        "outcomes": ["Plan user research", "Run usability tests", "Synthesize findings"],
        "lessons": ["Research planning", "User interviews", "Usability testing", "Synthesis"],
    },
    {
        "title": "Docker and Kubernetes Basics",
        "summary": "Package applications in containers and deploy them to a Kubernetes cluster.",
        "category": "Cloud & DevOps",
        "instructor": "amara",
        "level": "intermediate",
        "price": 69,
        "duration_hours": 11,
        "outcomes": ["Write Dockerfiles", "Compose multi-container apps", "Deploy to Kubernetes"],
        "lessons": [
            "Containers explained",
            "Writing a Dockerfile",
            "Docker Compose",
            "Kubernetes objects",
            "Deploying an app",
        ],
    },
    {
        "title": "Startup Fundamentals",
        "summary": "Validate an idea, find customers and build a lean business plan.",
        "category": "Business",
        "instructor": "amara",
        "level": "beginner",
        "price": 0,
        "duration_hours": 5,
        "outcomes": ["Validate a business idea", "Define a target market", "Draft a lean canvas"],
        "lessons": ["Finding a problem", "Customer discovery", "The lean canvas", "Pitching"],
    },
    {
        "title": "Web Security Essentials",
        "summary": "Recognize and prevent the most common web vulnerabilities from the OWASP Top 10.",
        "category": "Cybersecurity",
        "instructor": "sarah",
        "level": "advanced",
        "price": 89,
        "duration_hours": 8,
        "outcomes": ["Prevent injection attacks", "Secure authentication", "Harden HTTP headers"],
        "lessons": [
            "Threat modelling",
            "Injection",
            "Broken authentication",
            "Cross-site scripting",
        ],
    },
    {
        "title": "Flutter Mobile Apps (coming soon)",
        "summary": "Build beautiful cross-platform mobile apps with Flutter and Dart.",
        "category": "Mobile Development",
        "instructor": "sarah",
        "level": "beginner",
        "price": 29,
        "duration_hours": 10,
        "is_published": False,
        "outcomes": ["Write Dart code", "Compose Flutter widgets"],
        "lessons": ["Dart basics", "Widgets"],
    },
]

# (student email, course title, lessons completed, grades as (title, score, max_score, feedback))
ENROLLMENTS = [
    (
        "yasmine.haddad@learnhub.dev",
        "Modern Angular from Scratch",
        6,
        [
            ("Quiz 1", 18, 20, "Great work on signals."),
            ("Final project", 92, 100, "Clean, well-structured code."),
        ],
    ),
    (
        "yasmine.haddad@learnhub.dev",
        "FastAPI for Production APIs",
        3,
        [("Quiz 1", 15, 20, "Review dependency injection.")],
    ),
    ("yasmine.haddad@learnhub.dev", "Python for Data Analysis", 1, []),
    ("maria.garcia@learnhub.dev", "Modern Angular from Scratch", 4, [("Quiz 1", 17, 20, None)]),
    (
        "maria.garcia@learnhub.dev",
        "UI Design Essentials",
        5,
        [("Portfolio review", 88, 100, "Strong use of whitespace.")],
    ),
    ("maria.garcia@learnhub.dev", "UX Research Methods", 2, []),
    (
        "lucas.martin@learnhub.dev",
        "Python for Data Analysis",
        5,
        [("Assignment 1", 74, 100, "Good analysis; label your charts.")],
    ),
    (
        "lucas.martin@learnhub.dev",
        "Machine Learning Foundations",
        2,
        [("Quiz 1", 12, 20, "Revisit evaluation metrics.")],
    ),
    (
        "aisha.bello@learnhub.dev",
        "Docker and Kubernetes Basics",
        5,
        [("Lab 1", 95, 100, "Excellent Dockerfile.")],
    ),
    (
        "aisha.bello@learnhub.dev",
        "Responsive CSS Layouts",
        4,
        [("Layout challenge", 81, 100, None)],
    ),
    ("aisha.bello@learnhub.dev", "Web Security Essentials", 1, []),
    (
        "kofi.mensah@learnhub.dev",
        "Startup Fundamentals",
        4,
        [("Pitch", 66, 100, "Clarify your value proposition.")],
    ),
    ("kofi.mensah@learnhub.dev", "Modern Angular from Scratch", 2, []),
    (
        "emma.wilson@learnhub.dev",
        "Statistics for Decision Making",
        3,
        [("Problem set", 58, 100, "Practice hypothesis tests.")],
    ),
    ("emma.wilson@learnhub.dev", "UI Design Essentials", 1, []),
]

CONTACT_MESSAGES = [
    {
        "name": "Jordan Lee",
        "email": "jordan.lee@example.com",
        "subject": "Team licences",
        "message": "Hello, do you offer discounts for teams of 20 learners? Thank you!",
    },
    {
        "name": "Fatima Diallo",
        "email": "fatima.diallo@example.com",
        "subject": "Becoming an instructor",
        "message": "I would love to publish a course on French for beginners. How do I start?",
    },
]


def lesson_content(course_title: str, lesson_title: str) -> str:
    return (
        f'Welcome to "{lesson_title}", part of the course {course_title}.\n\n'
        f"In this lesson we introduce the key ideas behind {lesson_title.lower()}, "
        "walk through a worked example step by step, and finish with a short exercise "
        "so you can practise on your own.\n\n"
        "Key takeaways:\n"
        f"- What {lesson_title.lower()} is and why it matters\n"
        "- How to apply it in a real project\n"
        "- Common mistakes and how to avoid them\n\n"
        "When you are ready, mark this lesson as complete and continue to the next one."
    )
