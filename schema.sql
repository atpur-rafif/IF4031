CREATE TYPE role AS ENUM ('user', 'department', 'admin');
CREATE TYPE visibility AS ENUM ('public', 'private', 'anonymous');
CREATE TYPE complaint_status AS ENUM ('open', 'in_progress', 'resolved');

CREATE TABLE departments (
	department_id SERIAL PRIMARY KEY,
	name VARCHAR(255) UNIQUE NOT NULL,
	description TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE users (
	user_id SERIAL PRIMARY KEY,
	name VARCHAR(255),
	email VARCHAR(255) UNIQUE,
	password VARCHAR(255) NOT NULL,
	role role NOT NULL,
	department_id INT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL,
	CONSTRAINT department_for_user_role CHECK (
		(role = 'department' AND department_id IS NOT NULL) OR
		(role != 'department' AND department_id IS NULL)
	)
);

CREATE TABLE complaints (
	complaint_id SERIAL PRIMARY KEY,
	user_id INT NULL,
	department_id INT NOT NULL,
	visibility visibility NOT NULL,
	title VARCHAR(255),
	status complaint_status DEFAULT 'open',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
	FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

CREATE TABLE complaint_comments (
	comment_id SERIAL PRIMARY KEY,
	complaint_id INT NOT NULL,
	user_id INT NOT NULL,
	hide_user BOOLEAN,
	comment TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE attachments (
	attachment_id SERIAL PRIMARY KEY,
	comment_id INT NOT NULL,
	file_info VARCHAR(1024) NOT NULL,
	uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (comment_id) REFERENCES complaint_comments(comment_id) ON DELETE CASCADE
);

CREATE TABLE complaint_upvotes (
	upvote_id SERIAL PRIMARY KEY,
	complaint_id INT NOT NULL,
	user_id INT NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(user_id),
	CONSTRAINT unique_upvote UNIQUE (complaint_id, user_id)
);
