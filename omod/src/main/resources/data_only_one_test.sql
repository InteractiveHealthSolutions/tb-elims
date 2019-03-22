-- SET @dateFrom = '2017-01-01';
-- SET @dateTo = '2018-01-31';
-- SET @locationId = '1';

SELECT 'patient_id', 'identifier', 'given_name', 'family_name', 'gender', 'birthdate', 
'address1', 'address2', 'address3', 'city_village', 'county_district', 'state_province',
'occupation', 'primarycontact', 'referrername', 'referrerdesignation', 'referrercontact', 
'referrerorganization', 'referrerorganizationtype'  
UNION 
SELECT 
pt.patient_id, pi.identifier, pn.given_name, pn.family_name, pr.gender, DATE_FORMAT(pr.birthdate, '%Y-%m-%d'), 
padd.address1, padd.address2, padd.address3, padd.city_village, padd.county_district, padd.state_province,
IF(pat.name like '%occupation%', pa.value, null) occupation, 
IF(pat.name like '%Primary Contact Number%', pa.value, null) primarycontact, 
IF(pat.name like '%Referrer Name%', pa.value, null) referrername, 
IF(pat.name like '%Referrer Designation%', pa.value, null) referrerdesignation, 
IF(pat.name like '%Referrer Contact Number%', pa.value, null) referrercontact, 
IF(pat.name like '%Referrer Organization Name%', pa.value, null) referrerorganization, 
IF(pat.name like '%Referrer Organization Type%', pa.value, null) referrerorganizationtype
FROM patient pt
JOIN orders o USING(patient_id) 
JOIN encounter e ON e.encounter_id=pt.patient_id AND e.voided = 0  
JOIN encounter_type et ON et.encounter_type_id=e.encounter_type 
JOIN person pr ON pt.patient_id=pr.person_id
JOIN person_name pn ON pn.person_id=pt.patient_id 
JOIN person_address padd ON padd.person_id=pt.patient_id
JOIN patient_identifier pi ON pt.patient_id=pi.patient_id 
LEFT JOIN person_attribute pa ON pa.person_id=pt.patient_id
LEFT JOIN person_attribute_type pat ON pat.person_attribute_type_id=pa.person_attribute_type_id

LEFT JOIN location l ON e.location_id=l.location_id  
LEFT JOIN location l2 ON l.parent_location=l2.location_id  
LEFT JOIN location l3 ON l2.parent_location=l3.location_id  
LEFT JOIN location l4 ON l3.parent_location=l4.location_id  
LEFT JOIN location l5 ON l4.parent_location=l5.location_id  
-- patients having patient history = new patient on encounter Patient Registration (although this is asked only in form)
WHERE o.order_type_id=3 AND o.accession_number IS NOT NULL AND pt.voided = 0 AND o.voided = 0 
AND IF(@dateFrom = '' OR @dateTo = '', TRUE, o.date_activated BETWEEN @dateFrom AND @dateTo)   
AND IF(@locationId = '', TRUE, @locationId IN (l.name, l2.name, l3.name, l4.name, l5.name))
GROUP BY pt.patient_id HAVING COUNT(o.encounter_id) = 1