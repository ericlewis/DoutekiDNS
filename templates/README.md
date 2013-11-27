Windows Client for DoutekiDNS
------------------------------

Requires .Net Framework >= 2.0

Install the Windows client by running `compile.cmd`

By default, this will copy the executable file to C:\ so you will need to run the `compile.cmd` file as an administrator. After the file is copied, a scheduled task is created, which uses the variables `%DDNS_USER%`, `%DDNS_PASSWORD%`, `%DDNS_HOST%` and `%DDNS_ACTION%` as arguments, these can be set from the Control Panel, or arguments can be to fed directly by doing a manual run.


###Manual Run

<pre>
Usage: DoutekiDNSClient.exe <username:password> <host> <action>
Example: DoutekiDNSClient.exe jdoe:mypassword www.example.com domains/delete/1
</pre>
