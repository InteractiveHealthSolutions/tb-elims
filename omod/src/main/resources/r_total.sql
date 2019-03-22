-- SET @dateFrom = '';
-- SET @dateTo = '';
-- SET @locationId = '';

SELECT e.*, (e.smeartests - smearpositive - smearscanty) smearnegative
FROM 
(
	SELECT 
	COUNT(DISTINCT e.encounter_id) smeartests,
	COUNT(DISTINCT dtm.encounter_id) smeartestsdiagnosis,
	COUNT(DISTINCT ftm.encounter_id) smeartestsfollowup,
	SUM(IFNULL( IF(tr.value_coded IN (1362,1363,1364) , 1, 0) ,0)) smearpositive,
	SUM(IFNULL( IF(dtm.encounter_id IS NOT NULL AND tr.value_coded IN (1362,1363,1364) , 1, 0) ,0)) smearpositivediagnosis,
	SUM(IFNULL( IF(ftm.encounter_id IS NOT NULL AND tr.value_coded IN (1362,1363,1364) , 1, 0) ,0)) smearpositivefollowup,
	SUM(IFNULL( IF(tr.value_coded=159985 , 1, 0) ,0)) smearscanty,  
	SUM(IFNULL( IF(ftm.encounter_id IS NOT NULL AND tr.value_coded=159985 , 1, 0) ,0)) smearscantyfollowup   
	FROM encounter e 
	JOIN encounter_type et ON et.encounter_type_id=e.encounter_type 
	LEFT JOIN obs dtm ON e.encounter_id = dtm.encounter_id AND dtm.concept_id=164126 AND dtm.value_coded=161194 AND dtm.voided = 0   
	LEFT JOIN obs ftm ON e.encounter_id = ftm.encounter_id AND ftm.concept_id=164126 AND ftm.value_coded=160523 AND ftm.voided = 0   
	LEFT JOIN orders ts ON e.encounter_id = ts.encounter_id AND ts.voided = 0  
	LEFT JOIN encounter tre ON tre.uuid = ts.accession_number 
	LEFT JOIN obs tr ON tre.encounter_id=tr.encounter_id AND tr.concept_id IN(159982) AND tr.voided = 0  
    LEFT JOIN location l ON e.location_id=l.location_id  
	LEFT JOIN location l2 ON l.parent_location=l2.location_id  
	LEFT JOIN location l3 ON l2.parent_location=l3.location_id  
	LEFT JOIN location l4 ON l3.parent_location=l4.location_id  
	LEFT JOIN location l5 ON l4.parent_location=l5.location_id  
	WHERE et.name LIKE 'Microscopy%' AND e.voided = 0 
    AND IF(@dateFrom = '' OR @dateTo = '', TRUE, e.encounter_datetime BETWEEN @dateFrom AND @dateTo)   
    AND IF(@locationId = '', TRUE, @locationId IN (l.name, l2.name, l3.name, l4.name, l5.name))
) e