type ImageOptimization = {
  maxWidth: number;
  maxHeight: number;
  targetBytes: number;
  startQuality?: number;
  cropSquare?: boolean;
  fileName: string;
};

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

export async function optimizeImage(file: File, options: ImageOptimization) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("No fue posible procesar la fotografía.");
  }

  if (options.cropSquare) {
    const sourceSide = Math.min(bitmap.width, bitmap.height);
    const sourceX = Math.round((bitmap.width - sourceSide) / 2);
    const sourceY = Math.round((bitmap.height - sourceSide) / 2);
    const outputSide = Math.min(options.maxWidth, options.maxHeight, sourceSide);
    canvas.width = Math.max(1, outputSide);
    canvas.height = Math.max(1, outputSide);
    context.drawImage(bitmap, sourceX, sourceY, sourceSide, sourceSide, 0, 0, canvas.width, canvas.height);
  } else {
    const scale = Math.min(1, options.maxWidth / bitmap.width, options.maxHeight / bitmap.height);
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  }
  bitmap.close();

  let quality = options.startQuality ?? 0.84;
  let blob = await canvasToBlob(canvas, quality);
  while (blob && blob.size > options.targetBytes && quality > 0.48) {
    quality = Math.max(0.48, quality - 0.07);
    blob = await canvasToBlob(canvas, quality);
  }
  if (!blob) throw new Error("No fue posible comprimir la fotografía.");

  return new File([blob], options.fileName, { type: "image/jpeg", lastModified: Date.now() });
}
