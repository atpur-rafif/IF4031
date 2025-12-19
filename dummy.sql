INSERT INTO departments (name, description) VALUES
('HR', 'Handles human resources matters'),
('IT', 'Responsible for information technology'),
('Support', 'Handles customer support and technical issues');

INSERT INTO users (name, email, password, role, department_id) VALUES
('John Doe', 'john.doe@example.com', '$2a$12$JJ1F24Z0m2h5Jrf8uSlo8.LGSGsaQOwY2t2bJy/UT9vtsmkklGMOO', 'user', NULL),
('Jane Smith', 'jane.smith@example.com', '$2a$12$JJ1F24Z0m2h5Jrf8uSlo8.LGSGsaQOwY2t2bJy/UT9vtsmkklGMOO', 'admin', NULL),
('Michael Brown', 'michael.brown@example.com', '$2a$12$JJ1F24Z0m2h5Jrf8uSlo8.LGSGsaQOwY2t2bJy/UT9vtsmkklGMOO', 'department', 2),
('Emily White', 'emily.white@example.com', '$2a$12$JJ1F24Z0m2h5Jrf8uSlo8.LGSGsaQOwY2t2bJy/UT9vtsmkklGMOO', 'user', NULL),
('David Green', 'david.green@example.com', '$2a$12$JJ1F24Z0m2h5Jrf8uSlo8.LGSGsaQOwY2t2bJy/UT9vtsmkklGMOO', 'user', NULL);

INSERT INTO complaints (user_id, department_id, visibility, title, description, status) VALUES
(1, 1, 'public', 'Payroll issue', 'I have not received my paycheck this month', 'open'),
(2, 2, 'private', 'Server downtime', 'The server has been down for 3 hours', 'in_progress'),
(4, 3, 'anonymous', 'Long wait times', 'Support takes too long to respond to tickets', 'resolved'),
(5, 3, 'public', 'Missing documentation', 'I cannot find the latest documents in the shared folder', 'open');

INSERT INTO complaint_comments (complaint_id, user_id, hide_user, comment) VALUES
(1, 2, FALSE, 'We are investigating the payroll issue. Please share your employee ID.'),
(2, 1, TRUE, 'The issue has been escalated to IT. Please be patient.'),
(3, 3, FALSE, 'We are working to resolve the long wait times issue.'),
(4, 4, FALSE, 'The documents will be uploaded soon. We are working on it.');

INSERT INTO attachments (comment_id, file_info) VALUES
(1, 'payroll_issue_proof.pdf'),
(2, 'server_downtime_screenshot.png'),
(3, 'support_wait_time_log.csv'),
(4, 'missing_docs_screenshot.png');

INSERT INTO complaint_upvotes (complaint_id, user_id) VALUES
(1, 3),
(2, 4),
(1, 5),
(4, 2);
