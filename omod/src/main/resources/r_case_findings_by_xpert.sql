-- SET @dateFrom = '2017-01-01';
-- SET @dateTo = '2018-01-31';
-- SET @locationId = '1';

SELECT 
COUNT(DISTINCT pho.encounter_id) presumptives,
COUNT(DISTINCT dtx.encounter_id) riftests,
SUM(IFNULL( IF(dtxro.value_coded=162203 , 1, 0) ,0)) rifdetected,
SUM(IFNULL( IF(dtxro.value_coded=162204 , 1, 0) ,0)) rifnotdetected,
SUM(IFNULL( IF(dtxro.value_coded=1138 , 1, 0) ,0)) rifindeterminate,
SUM(IFNULL( IF(dtxro.value_coded IN (1302) , 1, 0) ,0)) mtbnotdetected,
SUM(IFNULL( IF(dtxro.value_coded=163611 , 1, 0) ,0)) invalid  
FROM encounter e 
JOIN encounter_type et ON et.encounter_type_id=e.encounter_type 
-- patients having patient history = new patient on encounter Patient Registration (although this is asked only in form)
LEFT JOIN obs pho ON et.name='Patient Registration' AND e.encounter_id = pho.encounter_id 
				AND pho.concept_id=165011 AND pho.value_coded=164144 AND pho.voided = 0 
-- RIF tests where test reason = diagnosis and results for it
LEFT JOIN obs dtx ON et.name='Xpert MTB/ RIF' AND e.encounter_id = dtx.encounter_id 
				AND dtx.concept_id=164126 AND dtx.value_coded=161194 AND dtx.voided = 0  
LEFT JOIN orders dtxo ON dtx.encounter_id = dtxo.encounter_id AND dtxo.voided = 0 
LEFT JOIN encounter dtxre ON dtxre.uuid = dtxo.accession_number 
LEFT JOIN obs dtxro ON dtxre.encounter_id=dtxro.encounter_id AND dtxro.concept_id IN(162202) AND dtxro.voided = 0  
LEFT JOIN location l ON e.location_id=l.location_id  
LEFT JOIN location l2 ON l.parent_location=l2.location_id  
LEFT JOIN location l3 ON l2.parent_location=l3.location_id  
LEFT JOIN location l4 ON l3.parent_location=l4.location_id  
LEFT JOIN location l5 ON l4.parent_location=l5.location_id  
WHERE et.name IN('Patient Registration', 'Xpert MTB/ RIF') AND e.voided = 0 
AND IF(@dateFrom = '' OR @dateTo = '', TRUE, e.encounter_datetime BETWEEN @dateFrom AND @dateTo)   
AND IF(@locationId = '', TRUE, @locationId IN (l.name, l2.name, l3.name, l4.name, l5.name))
