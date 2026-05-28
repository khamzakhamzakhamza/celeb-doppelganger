const API_BASE = "http://localhost:8000";
const ARCFACE_MODEL_PATH = "/models/arcface.onnx";

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
}
