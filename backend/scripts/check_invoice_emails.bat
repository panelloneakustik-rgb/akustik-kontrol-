@echo off
cd /d C:\akustik\backend
if not exist logs mkdir logs
.\venv\Scripts\python.exe manage.py check_invoice_emails >> logs\invoice_imap.log 2>&1
