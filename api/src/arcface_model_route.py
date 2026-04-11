import os
import boto3
from collections.abc import Iterator
from botocore.exceptions import ClientError
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

router = APIRouter(tags=["models"])

CHUNK_SIZE = 1024 * 1024

def _iter_s3_body(bucket: str, key: str) -> Iterator[bytes]:
    client = boto3.client("s3")

    obj = client.get_object(Bucket=bucket, Key=key)
    for chunk in obj["Body"].iter_chunks(chunk_size=CHUNK_SIZE):
        if chunk:
            yield chunk

@router.get("/models/arcface.onnx")
def stream_arcface_model() -> StreamingResponse:
    bucket, key = os.environ.get("ARCFACE_BUCKET"), os.environ.get("ARCFACE_KEY")

    return StreamingResponse(
        _iter_s3_body(bucket, key),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": 'inline; filename="arcface.onnx"',
        },
    )

