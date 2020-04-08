import * as fs from 'fs';
import { NoParamCallback } from 'fs';

/**
 * 拷贝文件夹
 * @export
 * @param {string} sourceDir
 * @param {string} targetDir
 * @param {NoParamCallback} [callback]
 */
function copydir(sourceDir: string, targetDir: string, callback?: NoParamCallback): void {
  fs.access(targetDir, function (err) {
    if (err) {
      fs.mkdirSync(targetDir); // 目录不存在时创建目录
    }
    _copy(null, sourceDir, targetDir);
  });

  function _copy(err: NodeJS.ErrnoException | null, sourceDir: string, targetDir: string): void {
    try {
      fs.readdir(sourceDir, function (err, paths) {
        paths.forEach(function (path) {
          var _src = sourceDir + '/' + path;
          var _dist = targetDir + '/' + path;

          fs.stat(_src, function (err, stat) {
            if (stat.isFile()) {
              fs.writeFileSync(_dist, fs.readFileSync(_src));
            } else if (stat.isDirectory()) {
              copydir(_src, _dist, callback);
            }
          });
        });
      });
    } catch (err) {
      callback && callback(err);
    }
  }
}

export { copydir };
