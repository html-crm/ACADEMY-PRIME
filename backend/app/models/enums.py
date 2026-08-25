import enum


class UserRole(str, enum.Enum):
    USER = "user"
    EXPERT = "expert"
    ADMIN = "admin"


class AccountStatus(str, enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    BANNED = "banned"


class ExpertStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


class VideoProvider(str, enum.Enum):
    YOUTUBE = "youtube"
    INSTAGRAM = "instagram"
    VIMEO = "vimeo"
    UPLOADED = "uploaded"


class ContentStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    PUBLISHED = "published"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


class Difficulty(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class VideoFormat(str, enum.Enum):
    SHORT = "short"
    LONG = "long"


class VerificationLevel(str, enum.Enum):
    PROVIDER_ENDED = "provider_ended"
    HEARTBEAT_ONLY = "heartbeat_only"
    MANUAL_REVIEW = "manual_review"


class RewardEntryType(str, enum.Enum):
    VIDEO_COMPLETION = "video_completion"
    COURSE_BONUS = "course_bonus"
    EXPERT_PAYMENT = "expert_payment"
    ADMIN_GRANT = "admin_grant"
    REVERSAL = "reversal"


class RewardStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    AVAILABLE = "available"
    CLAIMED = "claimed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REVERSED = "reversed"


class ClaimStatus(str, enum.Enum):
    REQUESTED = "requested"
    SUBMITTED = "submitted"
    CONFIRMED = "confirmed"
    FAILED = "failed"


class EarningStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    PAID = "paid"
    CANCELLED = "cancelled"


class ReportStatus(str, enum.Enum):
    OPEN = "open"
    REVIEWING = "reviewing"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class NotificationChannel(str, enum.Enum):
    IN_APP = "in_app"
