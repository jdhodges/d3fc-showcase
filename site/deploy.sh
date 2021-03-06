#!/bin/bash
# inspired by: https://gist.github.com/domenic/ec8b0fc8ab45f39403dd
set -e # exit with nonzero exit code if anything fails

echo "Deploying..."

if [ "${TRAVIS}" != true ]
then
    echo "This script is only intended to be run on Travis CI; not deploying."
    exit 0
fi

if [ "${TRAVIS_REPO_SLUG}" != "ScottLogic/BitFlux" ]
then
    echo "On fork; not deploying."
    exit 0
fi

if [ "${TRAVIS_PULL_REQUEST}" != "false" ]
then
    echo "Pull request; not deploying."
    exit 0
fi

# Ignore on any branch which isn't develop or master
if [ "${TRAVIS_BRANCH}" != "develop" ] && [ "${TRAVIS_BRANCH}" != "master" ]
then
    echo "On branch ${TRAVIS_BRANCH}, not master or develop; not deploying."
    exit 0
fi

cd site

echo "Creating temp directory for build..."
rm -rf temp
mkdir temp
cd temp

echo "Cloning master..."
git clone --branch master --depth 1 https://github.com/ScottLogic/BitFlux.git master

echo "Cloning develop..."
git clone --branch develop --depth 1 https://github.com/ScottLogic/BitFlux.git develop

cd master
MASTER=$(git describe --tags --always  2>&1)
echo "Building master... $MASTER"
npm install --quiet
grunt build --versionNumber="v$MASTER"

cd ../develop
DEVELOP=$(git describe --tags --always  2>&1)
echo "Building develop... $DEVELOP"
npm install --quiet
grunt build --versionNumber="v$DEVELOP"

echo "Creating directories for built application..."
cd ../../dist

rm -rf master
mkdir master
rm -rf develop
mkdir develop

echo "Copying built application files..."
cp -r ../temp/master/dist/* master
cp -r ../temp/develop/dist/* develop
rm -rf ../temp
printf '{"timestamp":"%s","travis_build_number":"%s","master_version":"%s","develop_version":"%s"}\n' "$(date +%s)" "$TRAVIS_BUILD_NUMBER" "$MASTER" "$DEVELOP" > versions.json

echo "Deploying to gh-pages..."

# create a *new* Git repo
git init

# inside this git repo we'll pretend to be a new user
git config user.name "Travis CI"
git config user.email "jleftley@scottlogic.com"

# The first and only commit to this new Git repo contains all the
# files present with the commit message "Deploy to GitHub Pages".
git add .
git commit -m "Deploy to GitHub Pages"

# Force push from the current repo's master branch to the remote
# repo's gh-pages branch. (All previous history on the gh-pages branch
# will be lost, since we are overwriting it.) We redirect any output to
# /dev/null to hide any sensitive credential data that might otherwise be exposed.
git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1

echo "Done."
