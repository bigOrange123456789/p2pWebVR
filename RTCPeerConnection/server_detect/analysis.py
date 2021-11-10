#创建文件夹
import os
def mkdir(path):
    if not os.path.exists(path):
        os.makedirs(path)

import json
def process(path):
    count=0
    time=0
    user_num=0
    for fileName in os.listdir(path):
        f1=open(path+"/"+fileName, encoding='gb18030', errors='ignore')
        j=json.load(f1)
        j['url']=''
        print(j)
        count=count+j['count0']+j['count1']
        time=time+j['timeSum0']+j['timeSum1']
        user_num=user_num+1
    n=count/user_num
    t=time/(user_num*count*1000)
    print(path)
    print('平均构建加载个数：',n)
    print('平均请求响应时间：',t,'\n')
    return [n,t]
r1=process('detection')


