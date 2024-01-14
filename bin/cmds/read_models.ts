import { default as fs } from "fs";
import { default as path } from "path";

/**
 * Reads all files in a directory that have a .gguf extension and returns an array of their filenames.
 * @param {string} dir - The path to the directory containing the gguf files.
 * @returns {Array<string>} An array of filenames with a .gguf extension found in the specified directory.
 */
function readModelsDir(dir: string): Array<string> {
  const models = new Array<string>();
  fs.readdirSync(dir).forEach((filename) => {
    const filepath = path.join(dir, filename);
    const isDir = fs.statSync(filepath).isDirectory();
    if (!isDir) {
      if (filename.endsWith(".gguf")) {
        models.push(filename)
      }
    }
  });
  return models
}

export { readModelsDir }