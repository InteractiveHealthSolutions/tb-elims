-- SET @dateFrom = '2017-01-01';
-- SET @dateTo = '2018-01-31';
-- SET @locationId = '1';

SELECT 'identifier', 'given_name', 'family_name', 'form_name', 'form_id', 'encounter_datetime', 'voided', 'date_voided', 
'location_level1', 'location_level2', 'location_level3', 'location_level4', 'location_level5', 
'date_created', 'reason_testing', 
'order_id', 'result_form_id', 'result_encounter_datetime', 'result'    
UNION 
SELECT pi.identifier, pn.given_name, pn.family_name, et.name form_name, e.encounter_id form_id, DATE_FORMAT(e.encounter_datetime, '%Y-%m-%d'), 
e.voided, DATE_FORMAT(e.date_voided, '%Y-%m-%d'), 
l.name location_level1, l2.name location_level2, l3.name location_level3, l4.name location_level4, l5.name location_level5, 
DATE_FORMAT(e.date_created, '%Y-%m-%d'), ctr.name reason_testing, 
ts.order_id, tre.encounter_id result_form_id, DATE_FORMAT(tre.encounter_datetime, '%Y-%m-%d') result_encounter_datetime, cn.name result 
FROM encounter e 
JOIN patient pt ON pt.patient_id=e.patient_id 
JOIN patient_identifier pi ON pt.patient_id=pi.patient_id and pi.preferred 
JOIN person_name pn ON pn.person_id=pt.patient_id and pn.preferred 
JOIN encounter_type et ON et.encounter_type_id=e.encounter_type 
LEFT JOIN obs dtm ON e.encounter_id = dtm.encounter_id AND dtm.concept_id=164126 AND dtm.value_coded=161194 AND dtm.voided = 0   
LEFT JOIN obs ftm ON e.encounter_id = ftm.encounter_id AND ftm.concept_id=164126 AND ftm.value_coded=160523 AND ftm.voided = 0   
LEFT JOIN concept_name ctr on coalesce(dtm.value_coded, ftm.value_coded)=ctr.concept_id and ctr.locale='en' and ctr.locale_preferred
LEFT JOIN orders ts ON e.encounter_id = ts.encounter_id AND ts.voided = 0  
LEFT JOIN encounter tre ON tre.uuid = ts.accession_number 
LEFT JOIN obs tr ON tre.encounter_id=tr.encounter_id AND tr.concept_id IN(162202) AND tr.voided = 0  
LEFT JOIN concept_name cn on tr.value_coded=cn.concept_id and cn.locale='en' and cn.locale_preferred
LEFT JOIN location l ON e.location_id=l.location_id  
LEFT JOIN location l2 ON l.parent_location=l2.location_id  
LEFT JOIN location l3 ON l2.parent_location=l3.location_id  
LEFT JOIN location l4 ON l3.parent_location=l4.location_id  
LEFT JOIN location l5 ON l4.parent_location=l5.location_id  
WHERE et.name LIKE 'Xpert%' AND e.voided = 0 
AND IF(@dateFrom = '' OR @dateTo = '', TRUE, e.encounter_datetime BETWEEN @dateFrom AND @dateTo)   
AND IF(@locationId = '', TRUE, @locationId IN (l.name, l2.name, l3.name, l4.name, l5.name))

