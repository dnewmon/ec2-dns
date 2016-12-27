var HOSTED_ZONE_ID = 'ZZZEXAMPLEZZZ';
var ZONE_NAME = 'developmentshack.com';
var TTL = 60;
var STATE_RUNNING = 'running';

function DnsUtility() {

	var _findServer = function (list, id) {
		for (var i = 0; i < list.length; i++) {
			if (list[i].id == id) {
				return list[i];
			}
		}
		
		return null;
	};
	
	var _findAddress = function (list, instanceId) {
		for (var i = 0; i < list.length; i++) {
			if (list[i].instanceId == instanceId) {
				return list[i];
			}
		}
		
		return null;
	};

	this.loadServers = function () {
		var servers = new Array();
		var runOpts = { output: '' };
		runCommand('aws', 'ec2', 'describe-instances', runOpts);

		var reservations = JSON.parse(runOpts.output).Reservations;

		for (var i = 0; i < reservations.length; i++) {
			var instances = reservations[i].Instances;
	
			for (var u = 0; u < instances.length; u++) {
				servers.push(new ServerInstance(instances[u]));
			}
		}
	
		return servers;
	};
	
	this.loadAddresses = function () {
		var addrs = new Array();
		var runOpts = { output: '' };
		runCommand('aws', 'ec2', 'describe-addresses', runOpts);
		
		var info = JSON.parse(runOpts.output).Addresses;
		for (var i = 0; i < info.length; i++) {
			addrs.push(new Address(info[i]));
		}
		
		return addrs;
	};
	
	this.findRunningServersWithoutAddresses = function () {
		var running = new Array();
		
		for (var i = 0; i < this.servers.length; i++) {
			var server = this.servers[i];
			if (server.state == STATE_RUNNING) {
				var addr = _findAddress(this.addresses, server.id);
				if (addr == null) {
					running.push(server);
				}
				else {
					server.updateDns(addr.ip);
				}
			}
		}
		
		return running;
	};
	
	this.findAddressesWithoutRunningServers = function () {
		var deadAddresses = new Array();
		
		for (var i = 0; i < this.addresses.length; i++) {
			var addr = this.addresses[i];
			var server = _findServer(this.servers, addr.instanceId);
			
			if (server == null || server.state != STATE_RUNNING) {
				deadAddresses.push(addr);
			}
		}
		
		return deadAddresses;
	};
	
	this.createAddress = function (instanceId) {
		var runOpts = { output: '' };
		runCommand('aws', 'ec2', 'allocate-address', '--domain', 'vpc', runOpts);
		
		var info = JSON.parse(runOpts.output);
		var id = info.AllocationId;
		var ip = info.PublicIp;
		
		runOpts = { output: '' };
		runCommand('aws', 'ec2', 'associate-address', '--allocation-id', id, '--instance-id', instanceId, runOpts);
		
		return ip;
	};
	
	this.deleteAddress = function (address) {
		var runOpts = { output: '' };
		runCommand('aws', 'ec2', 'disassociate-address', '--association-id', address.associationId, runOpts);
		
		var runOpts = { output: '' };
		runCommand('aws', 'ec2', 'release-address', '--allocation-id', address.allocationId, runOpts);
	};
	
	this.servers = this.loadServers();
	this.addresses = this.loadAddresses();
	
	var serversWithoutAddresses = this.findRunningServersWithoutAddresses();
	
	for (var i = 0; i < serversWithoutAddresses.length; i++) {
		var server = serversWithoutAddresses[i];
		
		print(server.id + ": " + server.state);
		var ipAddress = this.createAddress(server.id);
		server.updateDns(ipAddress);
	}
	
	var orphanedAddresses = this.findAddressesWithoutRunningServers();
	
	for (var i = 0; i < orphanedAddresses.length; i++) {
		var addr = orphanedAddresses[i];
		
		print(addr.instanceId + ": " + addr.ip);
		this.deleteAddress(addr);
	}
}

function Address(addr) {
	this.ip = addr.PublicIp;
	this.instanceId = addr.InstanceId;
	this.associationId = addr.AssociationId;
	this.allocationId = addr.AllocationId;
}

function ServerInstance(inst) {

	this.id = inst.InstanceId;
	this.state = inst.State.Name;
	this.tags = inst.Tags;
	
	this.getTag = function (name) {
		for (var i = 0; i < this.tags.length; i++) {
			if (this.tags[i].Key == name) {
				return this.tags[i].Value;
			}
		}
	};
	
	this.updateDns = function (ipAddress) {
		var hostName = this.getTag('dns');
		
		var record = {
		  "Comment": "Changed with a script",
		  "Changes": [
			{
			  "Action": "UPSERT",
			  "ResourceRecordSet": {
				"Name": hostName + "." + ZONE_NAME + ".",
				"Type": "A",
				"TTL": TTL,
				"ResourceRecords": [
				  {
				    "Value": ipAddress
				  }
				]
			  }
			}
		  ]
		};
		
		runOptions = { output: '' };
		runCommand('aws', 'route53', 'change-resource-record-sets', '--hosted-zone-id', HOSTED_ZONE_ID, 
			'--change-batch', JSON.stringify(record), runOptions);
	};
}

var utility = new DnsUtility();

