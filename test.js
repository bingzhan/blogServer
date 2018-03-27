12123
#!/bin/sh
set -e
git-update-server-info
gitosis-run-hook update-mirrors


unset GIT_DIR
DIR_ONE=/root/www/blogServer/
cd $DIR_ONE
git init
git remote add origin ~/www/blogServer.git
git clean -df
git pull origin master
