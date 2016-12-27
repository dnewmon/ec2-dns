#!/bin/bash
export AWS_SHARED_CREDENTIALS_FILE="/home/ec2-user/.aws/credentials"
export AWS_CONFIG_FILE="/home/ec2-user/.aws/config"
/usr/bin/java -jar /usr/bin/js.jar /etc/update-dns.js >> /var/log/dns.log 2>&1

