const ffmpeg = require("fluent-ffmpeg");

exports.convertToWav = (inputPath) => {
  return new Promise((resolve, reject) => {
    const outputPath = inputPath.replace(/\.[^/.]+$/, ".wav");

    ffmpeg(inputPath)
      .toFormat("wav")
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .save(outputPath);
  });
};
