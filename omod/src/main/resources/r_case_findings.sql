-- SET @dateFrom = '2017-01-01';
-- SET @dateTo = '2018-01-31';
-- SET @locationId = '1';

SELECT * FROM (
	SELECT 
	COUNT(DISTINCT pho.encounter_id) presumptives,
	SUM(IFNULL( IF(dtmro.value_coded IN (1362,1363,1364) AND dtxro.value_coded=703 , 1, 0) , 0)) positives,
    -- Any non null smear result means that test has been performed
	COUNT(DISTINCT dtmre.encounter_id) smeartests,
	SUM(IFNULL( IF(dtmro.value_coded=1362 , 1, 0) ,0)) smear1p,
	SUM(IFNULL( IF(dtmro.value_coded=1363 , 1, 0) ,0)) smear2p,
	SUM(IFNULL( IF(dtmro.value_coded=1364 , 1, 0) ,0)) smear3p,
	SUM(IFNULL( IF(dtmro.value_coded IN (1362,1363,1364) , 1, 0) ,0)) smearpositive,
	SUM(IFNULL( IF(dtmro.value_coded=159985 , 1, 0) ,0)) smearscanty 
	FROM encounter e 
    JOIN encounter_type et ON et.encounter_type_id=e.encounter_type 
    -- patients having patient history = new patient on encounter Patient Registration (although this is asked only in form)
	LEFT JOIN obs pho ON et.name='Patient Registration' AND e.encounter_id = pho.encounter_id 
					AND pho.concept_id=165011 AND pho.value_coded=164144 AND pho.voided = 0 
	-- patients having test reason = diagnosis on encounter Microscopy test (this would be only one per person)
    -- and find the test result for this
	LEFT JOIN obs dtm ON et.name='Microscopy' AND e.encounter_id = dtm.encounter_id 
					AND dtm.concept_id=164126 AND dtm.value_coded=161194 AND dtm.voided = 0 
	LEFT JOIN orders dtmo ON dtm.encounter_id = dtmo.encounter_id AND dtmo.voided = 0
	LEFT JOIN encounter dtmre ON dtmre.uuid = dtmo.accession_number 
	LEFT JOIN obs dtmro ON dtmre.encounter_id=dtmro.encounter_id AND dtmro.concept_id=159982 AND dtmro.voided = 0 
	-- patients having test reason = diagnosis on encounter CXR test (this would be only one per person)
	LEFT JOIN obs dtx ON et.name='CXR' AND e.encounter_id = dtx.encounter_id 
					AND dtx.concept_id=164126 AND dtx.value_coded=161194 AND dtx.voided = 0 
	LEFT JOIN orders dtxo ON dtx.encounter_id = dtxo.encounter_id AND dtxo.voided = 0 
	LEFT JOIN encounter dtxre ON dtxre.uuid = dtxo.accession_number 
	LEFT JOIN obs dtxro ON dtxre.encounter_id=dtxro.encounter_id AND dtxro.concept_id=12 AND dtxro.voided = 0 
    LEFT JOIN location l ON e.location_id=l.location_id  
    LEFT JOIN location l2 ON l.parent_location=l2.location_id  
    LEFT JOIN location l3 ON l2.parent_location=l3.location_id  
    LEFT JOIN location l4 ON l3.parent_location=l4.location_id  
    LEFT JOIN location l5 ON l4.parent_location=l5.location_id  
    WHERE e.voided = 0 
    AND IF(@dateFrom = '' OR @dateTo = '', TRUE, e.encounter_datetime BETWEEN @dateFrom AND @dateTo)   
    AND IF(@locationId = '', TRUE, @locationId IN (l.name, l2.name, l3.name, l4.name, l5.name))
) t1, 
(	SELECT COUNT(DISTINCT pl.patient_id) only1test FROM 
	(
		SELECT p.patient_id FROM patient p JOIN orders o USING(patient_id) 
        JOIN encounter e USING (encounter_id) 
        LEFT JOIN location l ON e.location_id=l.location_id  
		LEFT JOIN location l2 ON l.parent_location=l2.location_id  
		LEFT JOIN location l3 ON l2.parent_location=l3.location_id  
		LEFT JOIN location l4 ON l3.parent_location=l4.location_id  
		LEFT JOIN location l5 ON l4.parent_location=l5.location_id  
		WHERE o.order_type_id=3 AND o.accession_number IS NOT NULL AND p.voided = 0 AND o.voided = 0 
        AND IF(@dateFrom = '' OR @dateTo = '', TRUE, o.date_activated BETWEEN @dateFrom AND @dateTo)   
	    AND IF(@locationId = '', TRUE, @locationId IN (l.name, l2.name, l3.name, l4.name, l5.name))
		GROUP BY p.patient_id HAVING COUNT(o.encounter_id) = 1
	) pl
) t2 