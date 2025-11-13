import bleach
from typing import Any, Dict, List

# Allowed HTML tags for rich text content
ALLOWED_TAGS = [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'span', 'div'
]

# Allowed HTML attributes
ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'target'],
    'span': ['class'],
    'div': ['class'],
    'code': ['class']
}

# Allowed protocols for links
ALLOWED_PROTOCOLS = ['http', 'https', 'mailto']

def sanitize_html(text: str) -> str:
    """Sanitize HTML content, allowing safe tags"""
    if not text:
        return text
    return bleach.clean(
        text,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        protocols=ALLOWED_PROTOCOLS,
        strip=True
    )

def sanitize_text(text: str) -> str:
    """Strip all HTML tags from text"""
    if not text:
        return text
    return bleach.clean(text, tags=[], strip=True)

def sanitize_dict(data: Dict[str, Any], html_fields: List[str] = None, text_fields: List[str] = None) -> Dict[str, Any]:
    """Sanitize dictionary fields"""
    html_fields = html_fields or []
    text_fields = text_fields or []
    
    sanitized = data.copy()
    
    for field in html_fields:
        if field in sanitized and isinstance(sanitized[field], str):
            sanitized[field] = sanitize_html(sanitized[field])
    
    for field in text_fields:
        if field in sanitized and isinstance(sanitized[field], str):
            sanitized[field] = sanitize_text(sanitized[field])
    
    return sanitized
