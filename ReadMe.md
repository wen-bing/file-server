# nfileserver

This module is a simple way to share files over http. It's inspired from Python command: ```python -m SimpleHTTPServer```  


### How to use

```sh
npm install file-server
nfileserver -p 1990
Server running at http://localhost:1990
```
```nfileserver``` will create a http server listen on port 1990. Open ```http://localhost:1990/``` in your browser, you'll see the files, folders of currect directory are listed.