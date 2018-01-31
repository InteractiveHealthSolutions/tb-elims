package org.openmrs.module.tbelims;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.openmrs.BaseOpenmrsMetadata;
import org.openmrs.Location;

@Entity
@Table(name = "tbelims_device")
public class Device extends BaseOpenmrsMetadata {
	
	@Id
	@GeneratedValue
	@Column(name = "device_id")
	private int deviceId;
	
	@Column(name = "android_id")
	private String androidId;
	
	@Column(name = "serial_id")
	private String serialId;
	
	@Column(name = "mac_id")
	private String macId;
	
	@Column(name = "last_count")
	private int lastCount;
	
	@Column(name = "last_sync_date")
	private Date lastSyncDate;
	
	@ManyToOne
	@JoinColumn(name = "location_id")
	private Location location;
	
	public Device() {
		
	}
	
	public int getDeviceId() {
		return deviceId;
	}
	
	public void setDeviceId(int deviceId) {
		this.deviceId = deviceId;
	}
	
	public String getAndroidId() {
		return androidId;
	}
	
	public void setAndroidId(String androidId) {
		this.androidId = androidId;
	}
	
	public String getSerialId() {
		return serialId;
	}
	
	public void setSerialId(String serialId) {
		this.serialId = serialId;
	}
	
	public String getMacId() {
		return macId;
	}
	
	public void setMacId(String macId) {
		this.macId = macId;
	}
	
	public int getLastCount() {
		return lastCount;
	}
	
	public void setLastCount(int lastCount) {
		this.lastCount = lastCount;
	}
	
	public Date getLastSyncDate() {
		return lastSyncDate;
	}
	
	public void setLastSyncDate(Date lastSyncDate) {
		this.lastSyncDate = lastSyncDate;
	}
	
	public Location getLocation() {
		return location;
	}
	
	public void setLocation(Location location) {
		this.location = location;
	}
	
	@Override
	public Integer getId() {
		return deviceId;
	}
	
	@Override
	public void setId(Integer id) {
		this.deviceId = id;
	}
}
