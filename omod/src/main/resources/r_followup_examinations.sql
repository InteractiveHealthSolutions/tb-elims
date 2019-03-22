-- SET @dateFrom = '2017-01-01';
-- SET @dateTo = '2018-01-31';
-- SET @locationId = '1';

SELECT 
-- Any non null smear result means that test has been performed
COUNT(DISTINCT ftmre.encounter_id) smeartests,
SUM(IFNULL( IF(ftmro.value_coded=1362 , 1, 0) ,0)) smear1p,
SUM(IFNULL( IF(ftmro.value_coded=1363 , 1, 0) ,0)) smear2p,
SUM(IFNULL( IF(ftmro.value_coded=1364 , 1, 0) ,0)) smear3p,
SUM(IFNULL( IF(ftmro.value_coded IN (1362,1363,1364) , 1, 0) ,0)) smearpositive,
SUM(IFNULL( IF(ftmro.value_coded=159985 , 1, 0) ,0)) smearscanty 
FROM obs ftm 
JOIN encounter e ON e.encounter_id=ftm.encounter_id AND e.voided = 0  
JOIN encounter_type et ON et.encounter_type_id=e.encounter_type  
LEFT JOIN orders ftmo ON ftm.encounter_id = ftmo.encounter_id AND ftmo.voided = 0 
LEFT JOIN encounter ftmre ON ftmre.uuid = ftmo.accession_number 
LEFT JOIN obs ftmro ON ftmre.encounter_id=ftmro.encounter_id AND ftmro.concept_id=159982 AND ftmro.voided = 0 
LEFT JOIN location l ON e.location_id=l.location_id  
LEFT JOIN location l2 ON l.parent_location=l2.location_id  
LEFT JOIN location l3 ON l2.parent_location=l3.location_id  
LEFT JOIN location l4 ON l3.parent_location=l4.location_id  
LEFT JOIN location l5 ON l4.parent_location=l5.location_id  
-- patients having test reason = followup on encounter Microscopy test 
-- and find the test result for this 
WHERE et.name LIKE 'Microscopy%' AND ftm.concept_id=164126 AND ftm.value_coded=160523 AND ftm.voided = 0  
AND IF(@dateFrom = '' OR @dateTo = '', TRUE, e.encounter_datetime BETWEEN @dateFrom AND @dateTo)   
AND IF(@locationId = '', TRUE, @locationId IN (l.name, l2.name, l3.name, l4.name, l5.name))
