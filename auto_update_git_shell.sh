#! /bin/bash

date=`date "+%Y-%m-%d %H:%M:%S"`

if [ $# -ge 1 ]; then commit_msg="$date $1"
else commit_msg="$date"
fi

# echo "Submit info is: $commit_msg"

git add .
git commit -m "$commit_msg"
git push

echo "打开浏览器输入https://oss.console.aliyun.com/bucket/oss-cn-beijing/public-antplant-store/object/upload上传静态文件"

echo "打开浏览器输入https://cdn.console.aliyun.com/refresh/cache?accounttraceid=9dbe5048f68641fda8317814f941e6e8khad进行刷新预热"
echo "https://antplant.store/"
echo "https://antplant.store/index.html"