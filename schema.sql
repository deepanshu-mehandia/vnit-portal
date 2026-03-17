CREATE TABLE roles (
    role_id NUMBER PRIMARY KEY,
    role_name VARCHAR2(50) UNIQUE
);
CREATE TABLE users (
    user_id NUMBER PRIMARY KEY,
    username VARCHAR2(100) UNIQUE NOT NULL,
    password_hash VARCHAR2(255) NOT NULL,
    role_id NUMBER,
    created_at DATE DEFAULT SYSDATE,
    CONSTRAINT fk_role FOREIGN KEY(role_id) REFERENCES roles(role_id)
);
CREATE TABLE sessions (
    session_id NUMBER PRIMARY KEY,
    user_id NUMBER,
    login_time DATE,
    logout_time DATE,
    CONSTRAINT fk_session_user FOREIGN KEY(user_id) REFERENCES users(user_id)
);
CREATE TABLE departments (
    department_id NUMBER PRIMARY KEY,
    department_name VARCHAR2(100)
);
CREATE TABLE branches (
    branch_id NUMBER PRIMARY KEY,
    branch_name VARCHAR2(100),
    department_id NUMBER,
    CONSTRAINT fk_branch_dept FOREIGN KEY(department_id)
    REFERENCES departments(department_id)
);
CREATE TABLE academic_years (
    year_id NUMBER PRIMARY KEY,
    year_name VARCHAR2(20)
);
CREATE TABLE semesters (
    semester_id NUMBER PRIMARY KEY,
    semester_number NUMBER
);
CREATE TABLE courses (
    course_id NUMBER PRIMARY KEY,
    course_code VARCHAR2(20) UNIQUE,
    course_name VARCHAR2(200),
    credits NUMBER,
    branch_id NUMBER,
    CONSTRAINT fk_course_branch FOREIGN KEY(branch_id)
    REFERENCES branches(branch_id)
);
CREATE TABLE course_offerings (
    offering_id NUMBER PRIMARY KEY,
    course_id NUMBER,
    semester_id NUMBER,
    faculty_name VARCHAR2(100),
    CONSTRAINT fk_off_course FOREIGN KEY(course_id)
    REFERENCES courses(course_id),
    CONSTRAINT fk_off_sem FOREIGN KEY(semester_id)
    REFERENCES semesters(semester_id)
);
CREATE TABLE students (
    student_id NUMBER PRIMARY KEY,
    enrollment_no VARCHAR2(20) UNIQUE,
    first_name VARCHAR2(50),
    last_name VARCHAR2(50),
    branch_id NUMBER,
    admission_year NUMBER,
    CONSTRAINT fk_student_branch FOREIGN KEY(branch_id)
    REFERENCES branches(branch_id)
);
CREATE TABLE student_profiles (
    student_id NUMBER PRIMARY KEY,
    dob DATE,
    email VARCHAR2(100),
    mobile VARCHAR2(20),
    father_mobile VARCHAR2(20),
    mother_mobile VARCHAR2(20),
    nationality VARCHAR2(50),
    address VARCHAR2(200),
    CONSTRAINT fk_profile_student FOREIGN KEY(student_id)
    REFERENCES students(student_id)
);
CREATE TABLE student_bank (
    bank_id NUMBER PRIMARY KEY,
    student_id NUMBER,
    bank_name VARCHAR2(100),
    account_number VARCHAR2(50),
    ifsc_code VARCHAR2(20),
    CONSTRAINT fk_bank_student FOREIGN KEY(student_id)
    REFERENCES students(student_id)
);
CREATE TABLE registrations (
    registration_id NUMBER PRIMARY KEY,
    student_id NUMBER,
    semester_id NUMBER,
    registration_date DATE,
    CONSTRAINT fk_reg_student FOREIGN KEY(student_id)
    REFERENCES students(student_id),
    CONSTRAINT fk_reg_sem FOREIGN KEY(semester_id)
    REFERENCES semesters(semester_id)
);
CREATE TABLE registration_courses (
    reg_course_id NUMBER PRIMARY KEY,
    registration_id NUMBER,
    offering_id NUMBER,
    CONSTRAINT fk_reg_course FOREIGN KEY(registration_id)
    REFERENCES registrations(registration_id),
    CONSTRAINT fk_reg_off FOREIGN KEY(offering_id)
    REFERENCES course_offerings(offering_id)
);
CREATE TABLE attendance (
    attendance_id NUMBER PRIMARY KEY,
    student_id NUMBER,
    offering_id NUMBER,
    attended NUMBER,
    total_classes NUMBER,
    CONSTRAINT fk_att_student FOREIGN KEY(student_id)
    REFERENCES students(student_id),
    CONSTRAINT fk_att_off FOREIGN KEY(offering_id)
    REFERENCES course_offerings(offering_id)
);
CREATE TABLE internal_marks (
    mark_id NUMBER PRIMARY KEY,
    student_id NUMBER,
    offering_id NUMBER,
    quiz NUMBER,
    eval1 NUMBER,
    eval2 NUMBER,
    eval3 NUMBER,
    CONSTRAINT fk_mark_student FOREIGN KEY(student_id)
    REFERENCES students(student_id),
    CONSTRAINT fk_mark_off FOREIGN KEY(offering_id)
    REFERENCES course_offerings(offering_id)
);
CREATE TABLE results (
    result_id NUMBER PRIMARY KEY,
    student_id NUMBER,
    offering_id NUMBER,
    grade VARCHAR2(5),
    CONSTRAINT fk_result_student FOREIGN KEY(student_id)
    REFERENCES students(student_id),
    CONSTRAINT fk_result_off FOREIGN KEY(offering_id)
    REFERENCES course_offerings(offering_id)
);
CREATE TABLE fee_structure (
    fee_id NUMBER PRIMARY KEY,
    branch_id NUMBER,
    semester_id NUMBER,
    amount NUMBER,
    CONSTRAINT fk_fee_branch FOREIGN KEY(branch_id)
    REFERENCES branches(branch_id)
);
CREATE TABLE fee_demand (
    demand_id NUMBER PRIMARY KEY,
    student_id NUMBER,
    amount NUMBER,
    demand_date DATE,
    status VARCHAR2(20),
    CONSTRAINT fk_demand_student FOREIGN KEY(student_id)
    REFERENCES students(student_id)
);
CREATE TABLE fee_payments (
    payment_id NUMBER PRIMARY KEY,
    demand_id NUMBER,
    payment_date DATE,
    amount NUMBER,
    payment_method VARCHAR2(50),
    CONSTRAINT fk_payment_demand FOREIGN KEY(demand_id)
    REFERENCES fee_demand(demand_id)
);
CREATE TABLE hostels (
    hostel_id NUMBER PRIMARY KEY,
    hostel_name VARCHAR2(100)
);
CREATE TABLE blocks (
    block_id NUMBER PRIMARY KEY,
    hostel_id NUMBER,
    block_name VARCHAR2(50),
    CONSTRAINT fk_block_hostel FOREIGN KEY(hostel_id)
    REFERENCES hostels(hostel_id)
);
CREATE TABLE rooms (
    room_id NUMBER PRIMARY KEY,
    block_id NUMBER,
    room_number VARCHAR2(20),
    capacity NUMBER,
    CONSTRAINT fk_room_block FOREIGN KEY(block_id)
    REFERENCES blocks(block_id)
);
CREATE TABLE room_allocations (
    allocation_id NUMBER PRIMARY KEY,
    student_id NUMBER,
    room_id NUMBER,
    allocation_date DATE,
    CONSTRAINT fk_alloc_student FOREIGN KEY(student_id)
    REFERENCES students(student_id),
    CONSTRAINT fk_alloc_room FOREIGN KEY(room_id)
    REFERENCES rooms(room_id)
);
CREATE TABLE elections (
    election_id NUMBER PRIMARY KEY,
    election_name VARCHAR2(100),
    election_date DATE
);
CREATE TABLE candidates (
    candidate_id NUMBER PRIMARY KEY,
    election_id NUMBER,
    student_id NUMBER,
    manifesto VARCHAR2(500),
    CONSTRAINT fk_candidate_election FOREIGN KEY(election_id)
    REFERENCES elections(election_id),
    CONSTRAINT fk_candidate_student FOREIGN KEY(student_id)
    REFERENCES students(student_id)
);
CREATE TABLE votes (
    vote_id NUMBER PRIMARY KEY,
    election_id NUMBER,
    voter_student_id NUMBER,
    candidate_id NUMBER,
    CONSTRAINT fk_vote_election FOREIGN KEY(election_id)
    REFERENCES elections(election_id),
    CONSTRAINT fk_vote_candidate FOREIGN KEY(candidate_id)
    REFERENCES candidates(candidate_id)
);
CREATE TABLE feedback_forms (
    form_id NUMBER PRIMARY KEY,
    course_id NUMBER,
    semester_id NUMBER,
    CONSTRAINT fk_feedback_course FOREIGN KEY(course_id)
    REFERENCES courses(course_id)
);
CREATE TABLE feedback_questions (
    question_id NUMBER PRIMARY KEY,
    form_id NUMBER,
    question_text VARCHAR2(500),
    CONSTRAINT fk_question_form FOREIGN KEY(form_id)
    REFERENCES feedback_forms(form_id)
);
CREATE TABLE feedback_responses (
    response_id NUMBER PRIMARY KEY,
    question_id NUMBER,
    student_id NUMBER,
    rating NUMBER,
    CONSTRAINT fk_response_question FOREIGN KEY(question_id)
    REFERENCES feedback_questions(question_id),
    CONSTRAINT fk_response_student FOREIGN KEY(student_id)
    REFERENCES students(student_id)
);
