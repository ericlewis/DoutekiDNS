@echo off
csc /nologo /target:exe /out:DoutekiDNSClient.exe DoutekiDNSClient.cs
move DoutekiDNSClient.exe C:\DoutekiDNSClient.exe
schtasks /create /tn "DoutekiDNS" /tr "C:\DoutekiDNSClient.exe %DDNS_USER%:%DDNS_PASSWORD% %DDNS_HOST% %DDNS_ACTION%" /sc minute /mo 5