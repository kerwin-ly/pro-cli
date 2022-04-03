# #!/usr/bin/env bash
echo '开始构建 >>>' $1:$2

version=$(node -p "require('./package.json').version")
git checkout master
git pull origin master

sed -i "" 's/lib/# lib/' .gitignore
npm install
npm run build # generate lib

git fetch
git pull

git add .
git config user.name "ci_test"
git config user.email "ci_test"

echo 'release version >>>' $version
git commit -m "chore(release): release $version"

git fetch origin tag $version
if [ $? -ne 0 ]; then
  # 没有tag信息，表明当前tag不存在，可以直接打tag
  echo "ready to push tag >>> " $version
  git tag $version
  git push origin tag $version
else
  echo "tag ${version} has been released, will remove it now"
  git tag -d $version
  git push origin --delete $version
  git tag $version
  git push origin tag $version
fi

