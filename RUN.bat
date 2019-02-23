@echo off
START "server" /D %~dp0 cmd /c "cd server & python server.py"
timeout 3
START "client" /D %~dp0 cmd /c grunt serve