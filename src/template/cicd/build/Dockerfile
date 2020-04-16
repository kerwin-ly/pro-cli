FROM node:latest as builder

RUN npm config set registry https://registry.npm.taobao.org
RUN npm i npm@6.13.4 -g
WORKDIR /app
COPY .ssh /root/.ssh
RUN chmod 600 /root/.ssh/id_rsa
ADD package.json /app/package.json
RUN npm install
ADD . /app
RUN npm run build

# +++++++++++++++++++++++++++++++++++++++++++++++++++
FROM nginx:stable
RUN mkdir -p web/logs

# 将本地dist文件拷贝到/web/dist目录下，同时在nginx中配置root地址
COPY --from=builder /app/dist/ /web/dist/
# 将本地的nginx配置添加并替换docker中的nginx配置
ADD build/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80