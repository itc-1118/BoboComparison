<h1 align="center">
   <b>BoboComparison</b>
</h1>

<p align="center">基于Electron封装的应用程序《余弦相似度的文件比较工具》</p>


### 介绍

这个工具的核心算法是余弦相似度，它可以帮助我们度量两个文本文件之间的相似度，从而判断它们之间的相似程度。余弦相似度是一种用于比较两个向量夹角的方法，其取值范围在-1到1之间，其中-1表示完全不相似，而1表示完全相似。


### 核心能力

理论上支持任何文案级的文件对比（🤭也存在意外）
- 完整目录下文件递归对比
- 显示对比文件总数
- 显示参与比较的文件总数
- 统计比较目录的整体相似度百分比
- 统计单一文件的相似度百分比



### 不足 `👎之处`

- 需要控制对比的文件量在3000以内，大而多的文件都会产生耗时，影响使用。
- 仅支持MAC安装（还不能保证兼容🤦）


开发
```shell
npm install 
npm run start
```

部署
```shell
npm run build 
```

### 应用截图
![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/112a63c4ac5e468da456a775832ca505~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2298&h=1322&s=281990&e=png&b=fefefe)

如果有帮助，请给个🌟🌟
