INSERT INTO departments (name, description) VALUES
('HR', 'Handles human resources matters'),
('IT', 'Responsible for information technology'),
('Support', 'Handles customer support and technical issues');

INSERT INTO users (name, email, password, role, department_id) VALUES
('John Doe', 'john.doe@example.com', '$2a$12$JJ1F24Z0m2h5Jrf8uSlo8.LGSGsaQOwY2t2bJy/UT9vtsmkklGMOO', 'user', NULL),
('David Green', 'david.green@example.com', '$2a$12$JJ1F24Z0m2h5Jrf8uSlo8.LGSGsaQOwY2t2bJy/UT9vtsmkklGMOO', 'user', NULL),
('Jane Smith', 'jane.smith@example.com', '$2a$12$JJ1F24Z0m2h5Jrf8uSlo8.LGSGsaQOwY2t2bJy/UT9vtsmkklGMOO', 'admin', NULL),
('Michael Brown', 'michael.brown@example.com', '$2a$12$JJ1F24Z0m2h5Jrf8uSlo8.LGSGsaQOwY2t2bJy/UT9vtsmkklGMOO', 'department', 1),
('Emily White', 'emily.white@example.com', '$2a$12$JJ1F24Z0m2h5Jrf8uSlo8.LGSGsaQOwY2t2bJy/UT9vtsmkklGMOO', 'department', 2);

INSERT INTO complaints (user_id, department_id, private, anonymous, title, status) VALUES
(1, 1, false, false, 'Payroll issue', 'open'),
(1, 2, true, false, 'Server downtime', 'in_progress'),
(2, 2, true, true, 'Long wait times', 'resolved'),
(2, 2, false, true, 'Missing documentation', 'open');

INSERT INTO complaint_comments (complaint_id, user_id, anonymous, comment) VALUES
(1, 4, FALSE, 'We are investigating the payroll issue. Please share your employee ID.'),
(2, 5, TRUE, 'The issue has been escalated to IT. Please be patient.'),
(3, 5, FALSE, 'We are working to resolve the long wait times issue.'),
(4, 5, FALSE, 'The documents will be uploaded soon. We are working on it.');

INSERT INTO complaint_upvotes (complaint_id, user_id) VALUES
(1, 3),
(2, 4),
(1, 5),
(4, 2);
