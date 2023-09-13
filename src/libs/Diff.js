const fs = require("fs").promises;
const path = require("path");
const natural = require("natural");
const tokenizer = new natural.WordTokenizer();

/**
 * 计算两个文本内容的余弦相似度。
 *
 * 余弦相似度是一种度量两个向量方向之间夹角的方法，用于比较两个文本之间的相似度。
 * 在这个函数中，文本内容被分词为词汇，并将它们表示为二进制向量，其中每个词汇的存在用1表示，不存在用0表示。
 * 然后，计算这两个二进制向量之间的余弦相似度，得到一个范围在 -1（不相似）到 1（完全相似）之间的相似度分数。
 *
 * @param {string} content1 - 第一个文本内容。
 * @param {string} content2 - 第二个文本内容。
 * @returns {number} 余弦相似度分数，范围从 -1（不相似）到 1（完全相似）。
 *
 * @example
 * // 使用示例：
 * const text1 = "这是第一个文本内容";
 * const text2 = "这是另一个文本内容";
 * const similarityScore = calculateCosineSimilarity(text1, text2);
 * console.log(similarityScore); // 输出余弦相似度分数
 */
function calculateCosineSimilarity(content1, content2) {
  const tokens1 = tokenizer.tokenize(content1);
  const tokens2 = tokenizer.tokenize(content2);

  const tokenSet = new Set([...tokens1, ...tokens2]);

  const vector1 = Array.from(tokenSet).map((token) =>
    tokens1.includes(token) ? 1 : 0
  );

  const vector2 = Array.from(tokenSet).map((token) =>
    tokens2.includes(token) ? 1 : 0
  );

  // 计算向量点积
  let dotProduct = 0;
  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i];
  }

  // 计算向量长度
  const magnitude1 = Math.sqrt(
    vector1.reduce((sum, val) => sum + val * val, 0)
  );
  const magnitude2 = Math.sqrt(
    vector2.reduce((sum, val) => sum + val * val, 0)
  );

  // 计算余弦相似度
  const similarity = dotProduct / (magnitude1 * magnitude2);

  return isNaN(similarity) ? 1 : similarity;
}

// 比较两个文件的内容并返回相似度
async function compareFiles(file1, file2) {
  const content1 = await fs.readFile(file1, "utf-8");
  const content2 = await fs.readFile(file2, "utf-8");
  const similarity = calculateCosineSimilarity(content1, content2);

  return { file1, file2, similarity };
}

// 递归获取目录下的所有文件，包括子目录中的文件
async function getFilesInDirectory(directoryPath) {
  const files = await fs.readdir(directoryPath);
  const filePaths = files.map((file) => path.join(directoryPath, file));

  const filePromises = filePaths.map(async (filePath) => {
    const stats = await fs.stat(filePath);
    if (stats.isFile() && !path.basename(filePath).startsWith(".")) {
      return filePath; // 只返回普通文件路径且不是以点号开头的文件
    } else if (stats.isDirectory()) {
      const subDirectoryFiles = await getFilesInDirectory(filePath); // 递归处理子目录
      return subDirectoryFiles;
    }
    return null;
  });

  const filesInDirectory = await Promise.all(filePromises);
  return filesInDirectory.flat().filter((file) => file !== null);
}

// 检查文件是否为图片文件扩展名
function isImageFile(filePath) {
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".svg",
    ".ico",
  ];

  const extension = path.extname(filePath).toLowerCase();
  return imageExtensions.includes(extension);
}

/**
 * 计算整体相似度值的百分比，考虑每一个相似度文件的存在和相似度。
 *
 * 整体相似度值是两个目录中具有相同文件名和扩展名的文件中，内容相似的文件的相似度分数的加权平均。
 * 每个相似度文件的权重是其相似度分数，加权平均计算后得到整体相似度分数。
 *
 * @param {number} totalSimilarityScore - 所有相似度文件的相似度分数之和。
 * @param {number} totalSimilarityFileCount - 所有相似度文件的数量。
 * @param {number} totalFileCount - 所有参与对比的文件的数量。
 * @returns {number} 整体相似度值的百分比，范围从 0 到 100。
 */
function calculateOverallSimilarityPercentage(
  totalSimilarityScore,
  totalSimilarityFileCount,
  totalFileCount
) {
  // 计算整体相似度值的百分比，通过加权平均考虑每一个相似度文件的存在和相似度
  const overallSimilarityPercentage =
    (totalSimilarityScore / totalFileCount) * 100;
  return overallSimilarityPercentage;
}

// 主函数
const mainFunction = async (filesPath) => {
  const directoryB = path.join(filesPath[0]);
  const directoryC = path.join(filesPath[1]);

  try {
    const files1 = await getFilesInDirectory(directoryB);
    const files2 = await getFilesInDirectory(directoryC);

    const comparisons = [];

    let sameDirectoryCount = 0;
    let sameDirectoryAndFileCount = 0;
    let totalSimilarityScore = 0;
    let totalSimilarityFileCount = 0;

    for (const file1 of files1) {
      const fileName1 = path.basename(file1);

      if (isImageFile(file1)) {
        continue;
      }

      const matchingFile2 = files2.find((file2) => {
        const fileName2 = path.basename(file2);
        const file1RelativePath = path.relative(directoryB, file1);
        const file2RelativePath = path.relative(directoryC, file2);

        return (
          file1RelativePath === file2RelativePath &&
          fileName1 === fileName2 &&
          path.extname(file1) === path.extname(file2)
        );
      });

      if (matchingFile2) {
        const comparison = await compareFiles(file1, matchingFile2);
        comparisons.push(comparison);

        sameDirectoryCount++;
        sameDirectoryAndFileCount++;

        totalSimilarityScore += comparison.similarity;
        totalSimilarityFileCount++;
      } else {
        sameDirectoryCount++;
      }
    }

    const overallSimilarityPercentage = calculateOverallSimilarityPercentage(
      totalSimilarityScore,
      totalSimilarityFileCount,
      sameDirectoryCount
    );
    // 构建 JSON 对象
    const result = {
      sameDirectoryCount,
      sameDirectoryAndFileCount,
      overallSimilarityPercentage: overallSimilarityPercentage.toFixed(2),
      similarityFileComparisons: comparisons.map((comparison) => ({
        file1: path.relative(filesPath[0], comparison.file1),
        file2: path.relative(filesPath[1], comparison.file2),
        similarity: `${(comparison.similarity * 100).toFixed(2)}%`,
      })),
    };

    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = async function (filesPath) {
  try {
    const result = await mainFunction(filesPath);
    return result;
  } catch (error) {
    throw error;
  }
};
