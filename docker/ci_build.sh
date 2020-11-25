# #!/usr/bin/env bash
echo '开始构建 >>>' $1:$2

version=$(node -p "require('./package.json').version")
git checkout master
git pull origin master

# sed -i "" 's/lib/# lib/' .gitignore
npm install
npm run build # generate lib

git add .
git config user.name "ci_test"
git config user.email "ci_test"

echo 'release version >>>' $version
git commit -m "chore(release): release $version"

git tag $version
git push origin tag $version