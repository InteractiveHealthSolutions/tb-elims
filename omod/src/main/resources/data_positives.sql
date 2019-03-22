-- SET @dateFrom = '2017-01-01';
-- SET @dateTo = '2018-01-31';
-- SET @locationId = '1';

SELECT 'patient_id', 'identifier', 'given_name', 'family_name', 'gender', 'birthdate', 
'address1', 'address2', 'address3', 'city_village', 'county_district', 'state_province',
'occupation', 'primarycontact', 'referrername', 'referrerdesignation', 'referrercontact', 
'referrerorganization', 'referrerorganizationtype', 'microscopy_result', 'cxr_result'      
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
IF(pat.name like '%Referrer Organization Type%', pa.value, null) referrerorganizationtype,
cnm.name microscopy_result, cnx.name cxr_result   
FROM obs pho 
JOIN encounter e ON e.encounter_id=pho.encounter_id AND e.voided = 0  
JOIN encounter_type et ON et.encounter_type_id=e.encounter_type 

JOIN patient pt ON pt.patient_id=pho.person_id 
JOIN person pr ON pt.patient_id=pr.person_id
JOIN person_name pn ON pn.person_id=pt.patient_id 
JOIN person_address padd ON padd.person_id=pt.patient_id
JOIN patient_identifier pi ON pt.patient_id=pi.patient_id 
LEFT JOIN person_attribute pa ON pa.person_id=pt.patient_id
LEFT JOIN person_attribute_type pat ON pat.person_attribute_type_id=pa.person_attribute_type_id

JOIN encounter_type etm ON etm.name LIKE 'Microscopy%' 
JOIN encounter em ON em.encounter_id=pt.patient_id AND em.encounter_type=etm.encounter_type_id AND em.voided = 0  
-- Diagnosis microscopy test order result 
JOIN orders dtmo ON em.encounter_id = dtmo.encounter_id AND dtmo.voided = 0
JOIN encounter dtmre ON dtmre.uuid = dtmo.accession_number 
JOIN obs dtmro ON dtmre.encounter_id=dtmro.encounter_id AND dtmro.concept_id=159982 AND dtmro.voided = 0 
LEFT JOIN concept_name cnm on dtmro.value_coded=cnm.concept_id and cnm.locale='en' and cnm.locale_preferred
-- patients having test reason = diagnosis on encounter CXR test (this would be only one per person)
JOIN encounter_type etx ON etx.name = 'CXR'  
JOIN encounter ex ON ex.patient_id=pt.patient_id AND ex.encounter_type=etx.encounter_type_id AND ex.voided = 0  
JOIN obs dtx ON ex.encounter_id = dtx.encounter_id AND dtx.concept_id=164126 AND dtx.value_coded=161194 AND dtx.voided = 0 
JOIN orders dtxo ON dtx.encounter_id = dtxo.encounter_id AND dtxo.voided = 0 
JOIN encounter dtxre ON dtxre.uuid = dtxo.accession_number 
JOIN obs dtxro ON dtxre.encounter_id=dtxro.encounter_id AND dtxro.concept_id=12 AND dtxro.voided = 0 
LEFT JOIN concept_name cnx on dtxro.value_coded=cnx.concept_id and cnx.locale='en' and cnx.locale_preferred

LEFT JOIN location l ON e.location_id=l.location_id  
LEFT JOIN location l2 ON l.parent_location=l2.location_id  
LEFT JOIN location l3 ON l2.parent_location=l3.location_id  
LEFT JOIN location l4 ON l3.parent_location=l4.location_id  
LEFT JOIN location l5 ON l4.parent_location=l5.location_id  
-- patients having patient history = new patient on encounter Patient Registration (although this is asked only in form)
WHERE et.name='Patient Registration' AND pho.concept_id=165011 AND pho.value_coded=164144 AND pho.voided = 0 
AND IF(@dateFrom = '' OR @dateTo = '', TRUE, e.encounter_datetime BETWEEN @dateFrom AND @dateTo)   
AND IF(@locationId = '', TRUE, @locationId IN (l.name, l2.name, l3.name, l4.name, l5.name))
group by pt.patient_id