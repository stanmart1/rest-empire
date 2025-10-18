from pydantic import BaseModel

class FAQBase(BaseModel):
    category: str
    question: str
    answer: str
    order: int = 0

class FAQCreate(FAQBase):
    pass

class FAQUpdate(FAQBase):
    pass

class FAQResponse(FAQBase):
    id: int

    class Config:
        from_attributes = True
