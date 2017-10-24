package org.openmrs.module.tbelims.api;

import java.util.Date;
import java.util.List;

import org.openmrs.Encounter;
import org.openmrs.PersonAddress;

public interface EncounterDataService {
	
	List<Encounter> findEncounters(String patient, String location, List<String> encounterTypes, PersonAddress address,
	        Date dateFrom, Date dateTo, PaginationHandler pagination);
	
}
