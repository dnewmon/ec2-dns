# ec2-dns

This is an automation script that allocates and releases IP addresses in Amazon AWS EC2
for instances based on their running state.  It also works as a dynamic-DNS service
by updating Amazon Route53 records with these IP addresses.

I implemented this script because it can save you money by releasing IP addresses 
that are unused.

### Implementation details

It identifies two scenarios:

1. Instances running without a Public IP address.
2. IP addresses associated with instances that are not running.

With instances running without an IP address, it allocates and associates 
an EC2 VPC address with the instance.  It also updates a DNS record based 
on a 'dns' tag on the instance.  So, if you tagged 'dns' with a value of 
'blog', it would update 'blog.example.com' with the IP address of the instance.

With IP addresses associated with instances that are not running, it
disassociates and releases the IP address.  It doesn't remove the DNS records
since those are free.

I built this using the (Mozilla Rhino)[https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Rhino] Javascript engine.  This provided
an easy way to parse the JSON outputs from the AWS CLI, and create logic
around it instead of using the full-blown AWS APIs. This also makes it 
easy to use on an Amazon Linux AMI.  Java and the AWS CLI are already 
installed so configuration is dirt simple.

## Installation instructions

* Configure AWS CLI to output in a JSON format, and tie it to your account / zone
* Configure HOSTED_ZONE_ID and ZONE_NAME at the top of update-dns.js
* Copy js.jar to /usr/bin/js.jar
* Copy update-dns.js and update-dns.jar to /etc/
* Edit crontab to include:  *  *  *  *  * root      /etc/update-dns.sh

