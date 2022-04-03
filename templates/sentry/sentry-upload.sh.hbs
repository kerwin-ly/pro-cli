# You can set token & project name here!
# You can reference the article:http://wiki.company.com/pages/viewpage.action?pageId=3147181
export SENTRY_AUTH_TOKEN={{authToken}}
export SENTRY_URL='http://starport.company.com/'
export SENTRY_ORG='starport'
export SENTRY_PROJECT={{projectName}}

RELEASES_NAME=$(node -p "require('./package.json').version")
UPLOAD_DIST='./dist'

echo sourcemaps 版本：$RELEASES_NAME
sentry-cli releases new $RELEASES_NAME
sentry-cli releases files $RELEASES_NAME upload-sourcemaps $UPLOAD_DIST
echo "Finalized release for $RELEASES_NAME"