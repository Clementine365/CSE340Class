-- 2.and 3. and 4 test select with classification table 
SELECT * 
FROM classification
WHERE classification_id = 2;

---test update with classification table 
UPDATE classification
SET classification_name = 'custom'
WHERE classification_id = 1;


---test delete with classification table 
DELETE FROM classification
WHERE classification_id = 6;

---test insert with classification table

INSERT INTO classification (classification_name)
VALUES ('Economy');


--- insert the tony account

INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');


--update 
UPDATE account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';


--delete 
DELETE FROM account
WHERE account_email = 'tony@starkent.com';

-- 4. update invetory GM hummer

UPDATE inventory
SET inv_description = REPLACE(inv_description, ' the small interiors', ' a huge interior')
WHERE inv_model = 'Hummer';


--- 5.select from inventory and classification 
SELECT i.inv_make, i.inv_model, c.classification_name
FROM inventory i
INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';


--6 update the invetory path
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');