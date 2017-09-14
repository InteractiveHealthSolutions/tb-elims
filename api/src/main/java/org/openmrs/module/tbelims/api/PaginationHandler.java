package org.openmrs.module.tbelims.api;

public abstract class PaginationHandler {
	
	private long totalRows;
	
	private int start = 0;
	
	private int limit = 20;
	
	public void setTotalRows(long totalRows) {
		this.totalRows = totalRows;
	}
	
	public void limit(int limit) {
		this.limit = limit;
	}
	
	public void start(int start) {
		this.start = start;
	}
	
	public int limit() {
		return limit;
	}
	
	public int start() {
		return start;
	}
	
	public long totalRows() {
		return totalRows;
	}
}
