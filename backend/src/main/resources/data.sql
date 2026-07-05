-- General Physicians (Faster consultation times)
INSERT INTO doctor (name, speciality, avg_consultation_time) 
SELECT 'Dr. Anil Fernando', 'General Physician', 10 
WHERE NOT EXISTS (SELECT 1 FROM doctor WHERE name = 'Dr. Anil Fernando');


INSERT INTO doctor (name, speciality, avg_consultation_time) 
SELECT 'Dr. Chaminda Perera', 'General Physician', 10 
WHERE NOT EXISTS (SELECT 1 FROM doctor WHERE name = 'Dr. Chaminda Perera');


-- Specialists (Slightly longer consultation times)
INSERT INTO doctor (name, speciality, avg_consultation_time) 
SELECT 'Dr. Ruwanthi Senanayake', 'Cardiologist', 15 
WHERE NOT EXISTS (SELECT 1 FROM doctor WHERE name = 'Dr. Ruwanthi Senanayake');

INSERT INTO doctor (name, speciality, avg_consultation_time) 
SELECT 'Dr. S. Jeganathan', 'Neurologist', 20 
WHERE NOT EXISTS (SELECT 1 FROM doctor WHERE name = 'Dr. S. Jeganathan');

INSERT INTO doctor (name, speciality, avg_consultation_time) 
SELECT 'Dr. Fathima Rizvi', 'Pediatrician', 12 
WHERE NOT EXISTS (SELECT 1 FROM doctor WHERE name = 'Dr. Fathima Rizvi');




INSERT INTO doctor (name, speciality, avg_consultation_time) 
SELECT 'Dr. Kithsiri Silva', 'Orthopedic Surgeon', 15 
WHERE NOT EXISTS (SELECT 1 FROM doctor WHERE name = 'Dr. Kithsiri Silva');


INSERT INTO doctor (name, speciality, avg_consultation_time) 
SELECT 'Dr. M. A. Dissanayake', 'Endocrinologist', 15 
WHERE NOT EXISTS (SELECT 1 FROM doctor WHERE name = 'Dr. M. A. Dissanayake');


INSERT INTO doctor (name, speciality, avg_consultation_time) 
SELECT 'Dr. Priyantha Gunawardena', 'ENT Surgeon', 12 
WHERE NOT EXISTS (SELECT 1 FROM doctor WHERE name = 'Dr. Priyantha Gunawardena');



INSERT INTO doctor (name, speciality, avg_consultation_time) 
SELECT 'Dr. Tharushi Jayasinghe', 'Dermatologist', 10 
WHERE NOT EXISTS (SELECT 1 FROM doctor WHERE name = 'Dr. Tharushi Jayasinghe');
