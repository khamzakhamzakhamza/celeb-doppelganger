import * as ort from "onnxruntime-web";

const API_BASE = "http://localhost:8000";
const ARCFACE_MODEL_PATH = "/models/arcface.onnx";
const SEARCH_PATH = "/search";

const MODEL_INPUT_SIZE = 112;
const PIXEL_CENTER = 127.5;
const PIXEL_SCALE = 128.0;

export type SearchResult = {
  similarity: number;
  name: string;
  image_url: string;
  category: string;
};

export class ArcfaceService {
  public async downloadArcfaceModel(): Promise<ArrayBuffer> {
    const res = await fetch(`${API_BASE}${ARCFACE_MODEL_PATH}`);
    
    if (!res.ok) {
      throw new Error(
        `Failed to download ArcFace model (${res.status}): ${await res.text().catch(() => "")}`,
      );
    }

    return res.arrayBuffer();
  }

  public async search(embedding: Float32Array): Promise<SearchResult[]> {
    const res = await fetch(`${API_BASE}${SEARCH_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embedding: Array.from(embedding),
      }),
    });
    
    if (!res.ok) {
      throw new Error(
        `Failed to search celebrities (${res.status}): ${await res.text().catch(() => "")}`,
      );
    }

    return res.json();
  }

  public async buildEmbeddingFromBlobs(rawImages: Blob[], modelBytes: ArrayBuffer): Promise<Float32Array> {
    const session = await this.createSession(modelBytes);

    const images = await this.preprocessImages(rawImages);

    const inputName = session.inputNames[0];
    const outputName = session.outputNames[0];

    const embeddings: Float32Array[] = [];
    for (const img of images) {
      const inputTensor = new ort.Tensor("float32", img, [1, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, 3]);
      
      const outputs = await session.run({ [inputName]: inputTensor });
      const output = outputs[outputName];

      const embedding = output.data as Float32Array;
      embeddings.push(this.l2Normalize(embedding));
    }
    
    const dimension = embeddings[0].length;
    const averaged = new Float32Array(dimension);
    for (let i = 0; i < embeddings.length; i++) {
      for (let j = 0; j < dimension; j++) {
        averaged[j] += embeddings[i][j];
        
        if (i == embeddings.length - 1) averaged[j] /= embeddings.length;
      }
    }

    return this.l2Normalize(averaged);
  }

  private async createSession(modelBytes: ArrayBuffer): Promise<import("onnxruntime-web").InferenceSession> {
    ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/"

    return ort.InferenceSession.create(modelBytes, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    });
  }

  private async preprocessImages(images: Blob[]): Promise<Float32Array[]> {
    const response : Float32Array[] = [];

    const canvas = document.createElement("canvas");
    canvas.width = MODEL_INPUT_SIZE;
    canvas.height = MODEL_INPUT_SIZE;
    
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Could not create 2D canvas context.");

    for (const img of images) {
      const bitmap = await createImageBitmap(img);

      try {
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const imgRgbaData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        response.push(this.rgbaToRgb(imgRgbaData));
      } finally {
        bitmap.close();
      }
    }

    return response;
  }

  private rgbaToRgb(rgbaData: ImageDataArray): Float32Array {
    const getScaledValue = (val: number) => (val - PIXEL_CENTER) / PIXEL_SCALE; 

    const rgbData = new Float32Array(MODEL_INPUT_SIZE * MODEL_INPUT_SIZE * 3);

    let i = 0;
    for (let j = 0; j < rgbaData.length; j += 4) {
      rgbData[i] = getScaledValue(rgbaData[j]);
      rgbData[i + 1] = getScaledValue(rgbaData[j + 1]);
      rgbData[i + 2] = getScaledValue(rgbaData[j + 2]);
      i += 3;
    }

    return rgbData;
  }

  private l2Normalize(values: Float32Array): Float32Array {
    let norm = 0;
    for (let i = 0; i < values.length; i++) {
      norm += values[i] * values[i];
    }

    const scale = 1 / Math.sqrt(norm);
    for (let i = 0; i < values.length; i++) {
      values[i] *= scale;
    }

    return values;
  }
}
