from fastapi import HTTPException, status

class InvalidFileFormat(HTTPException):
    def __init__(self, detail: str = "Invalid file format. Only PDF, PPT, DOCX, TXT allowed."):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

class EmptyContentError(HTTPException):
    def __init__(self, detail: str = "File contains no extractable text."):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

class IndexingFailed(HTTPException):
    def __init__(self, detail: str = "Failed to index content."):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)

class ConfigurationError(HTTPException):
    def __init__(self, detail: str = "Invalid quiz configuration."):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

class AIModelError(HTTPException):
    def __init__(self, detail: str = "AI Model failed to generate content."):
        super().__init__(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail)

class SessionExpiredError(HTTPException):
    def __init__(self, detail: str = "Quiz session has expired or is invalid."):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)