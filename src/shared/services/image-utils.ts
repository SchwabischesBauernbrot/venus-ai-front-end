import Compressor from "compressorjs";

export const compressImage = (file: File | Blob): Promise<File> => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.9,
      maxWidth: 800,
      minWidth: 100,
      success(result) {
        resolve(result as File);
      },
      error(err) {
        reject(err);
      },
      convertSize: 300 * 1000, // resize all image more than 300kb because Supabase img resize suck lol
    });
  });
};
