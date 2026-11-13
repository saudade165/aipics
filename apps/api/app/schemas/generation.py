"""Generation request schemas.

Files are never uploaded to this API in the current release. Requests carry
only *descriptors* (name, size, MIME type) of files the user previewed in the
browser, which lets the backend validate a complete configuration.
"""

from typing import Annotated, Literal

from pydantic import BaseModel, Field, field_validator

IMAGE_MIME_TYPES = {"image/png", "image/jpeg", "image/webp"}
VIDEO_MIME_TYPES = {"video/mp4", "video/webm", "video/quicktime"}
MAX_IMAGE_BYTES = 10 * 1024 * 1024
MAX_VIDEO_BYTES = 200 * 1024 * 1024


class FileDescriptor(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    size_bytes: int = Field(gt=0)
    mime_type: str
    width: int | None = Field(default=None, gt=0)
    height: int | None = Field(default=None, gt=0)
    duration_seconds: float | None = Field(default=None, gt=0)


class ImageFile(FileDescriptor):
    @field_validator("mime_type")
    @classmethod
    def _image_mime(cls, value: str) -> str:
        if value not in IMAGE_MIME_TYPES:
            raise ValueError(f"Unsupported image type. Allowed: {', '.join(sorted(IMAGE_MIME_TYPES))}")
        return value

    @field_validator("size_bytes")
    @classmethod
    def _image_size(cls, value: int) -> int:
        if value > MAX_IMAGE_BYTES:
            raise ValueError("Image exceeds the 10 MB limit.")
        return value


class VideoFile(FileDescriptor):
    @field_validator("mime_type")
    @classmethod
    def _video_mime(cls, value: str) -> str:
        if value not in VIDEO_MIME_TYPES:
            raise ValueError(f"Unsupported video type. Allowed: {', '.join(sorted(VIDEO_MIME_TYPES))}")
        return value

    @field_validator("size_bytes")
    @classmethod
    def _video_size(cls, value: int) -> int:
        if value > MAX_VIDEO_BYTES:
            raise ValueError("Video exceeds the 200 MB limit.")
        return value


Prompt = Annotated[str, Field(min_length=3, max_length=4000)]
OptionalPrompt = Annotated[str | None, Field(default=None, max_length=4000)]
NegativePrompt = Annotated[str | None, Field(default=None, max_length=2000)]
Unit = Annotated[float, Field(ge=0, le=1)]


class _Base(BaseModel):
    model_id: str = Field(min_length=1, max_length=64)
    seed: int | None = Field(default=None, ge=0, le=2**32 - 1)


class ImageGenerationRequest(_Base):
    kind: Literal["image"]
    prompt: Prompt
    negative_prompt: NegativePrompt = None
    aspect_ratio: str
    resolution: str
    num_outputs: int = Field(default=1, ge=1, le=8)
    guidance: float | None = Field(default=None, ge=1, le=20)
    references: list[ImageFile] = Field(default_factory=list, max_length=8)


class VideoGenerationRequest(_Base):
    kind: Literal["video"]
    mode: Literal["text_to_video", "image_to_video", "reference_to_video"]
    prompt: Prompt
    negative_prompt: NegativePrompt = None
    aspect_ratio: str
    resolution: str
    duration: int = Field(gt=0, le=60)
    audio: bool = False
    motion_strength: Unit = 0.5
    first_frame: ImageFile | None = None
    last_frame: ImageFile | None = None
    reference_video: VideoFile | None = None
    references: list[ImageFile] = Field(default_factory=list, max_length=8)


class CharacterGenerationRequest(_Base):
    kind: Literal["character"]
    workflow: Literal["motion_transfer", "character_replacement", "reference_to_video", "multi_image_conditioning"]
    character_name: str = Field(min_length=1, max_length=80)
    prompt: OptionalPrompt = None
    aspect_ratio: str
    resolution: str
    duration: int = Field(gt=0, le=60)
    identity_strength: Unit = 0.8
    motion_strength: Unit = 0.7
    face_consistency: bool = True
    preserve_background: bool = True
    references: list[ImageFile] = Field(min_length=1, max_length=8)
    reference_video: VideoFile | None = None


class UpscaleRequest(_Base):
    kind: Literal["upscale"]
    image: ImageFile
    scale: int = Field(ge=2, le=8)
    mode: Literal["faithful", "balanced", "creative"] = "balanced"
    denoise: Unit = 0.3
    sharpen: Unit = 0.2
    face_enhance: bool = False
    output_format: Literal["png", "jpeg", "webp"] = "png"


class VideoEnhanceRequest(_Base):
    kind: Literal["video_enhance"]
    video: VideoFile
    target_resolution: str
    target_fps: int = Field(ge=12, le=240)
    denoise: Unit = 0.3
    stabilization: bool = False
    frame_interpolation: bool = False
    output_format: Literal["mp4", "mov", "webm"] = "mp4"


GenerationRequest = Annotated[
    ImageGenerationRequest | VideoGenerationRequest | CharacterGenerationRequest | UpscaleRequest | VideoEnhanceRequest,
    Field(discriminator="kind"),
]


class CostEstimate(BaseModel):
    tokens: int
    breakdown: list[str]
    note: str = "Estimate only. Token billing is not active in this release."


class GenerationPreviewResponse(BaseModel):
    status: Literal["integration_disabled"]
    executed: Literal[False] = False
    validated: bool = True
    message: str
    feature: str
    feature_status: str
    model_id: str
    model_name: str
    estimated_cost: CostEstimate
    next_steps: list[str]
