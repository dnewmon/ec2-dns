# ec2-dns

This is an automation script that allocates and releases IP addresses in Amazon AWS EC2
for instances based on their running state.  It also works as a dynamic-DNS service
by updating Amazon Route53 records with these IP addresses.

1. Instances running without a Public IP address.
2. IP Addresses associated with instances that are not running.

With instances running without an IP address, it allocates and associates 
an EC2 VPC address with the instance.  It also updates a DNS record based 
on a 'dns' tag on the instance.  So, if you tagged 'dns' with a value of 
'blog', it would update 'blog.example.com' with the IP address of the instance.

With IP addresses associated with instances that are not running, it
disassociates and releases the IP address.

## Installation instructions

* Configure HOSTED_ZONE_ID and ZONE_NAME at the top of update-dns.js
* Copy js.jar to /usr/bin/js.jar
* Copy update-dns.js and update-dns.jar to /etc/
* Edit crontab to include:  *  *  *  *  * root      /etc/update-dns.sh

