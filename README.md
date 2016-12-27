# ec2-dns

This is an automation script that finds two things:

# Servers running without a Public IP address
# IP Addresses associated with Servers not running

## Installation Notes

* Copy js.jar to /usr/bin/js.jar
* Copy update-dns.js and update-dns.jar to /etc/
* Edit crontab to include:  *  *  *  *  * root      /etc/update-dns.sh

