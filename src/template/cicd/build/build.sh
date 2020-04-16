#!/bin/bash

echo '开发环境打包 >>>' $1:$2

cp -r ~/.ssh .

# 构建镜像
docker build -t $1:$2 -f build/Dockerfile .

# 推送镜像
docker push $1:$2

rm -rf .ssh