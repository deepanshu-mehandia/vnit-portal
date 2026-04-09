from pydantic import BaseModel

class AdmissionCreate(BaseModel):
    name: str
    email: str
    mobile: str
    dob: str
    gender: str
    category: str
    state: str
    address: str
    program_type_id: int
    program_id: int
    program_title_id: int