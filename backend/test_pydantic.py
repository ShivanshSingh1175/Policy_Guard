from pydantic import BaseModel, Field
import json

class TestModel(BaseModel):
    id: str = Field(validation_alias="_id")
    name: str

data = {"_id": "123", "name": "test"}
obj = TestModel(**data)
print(f"Object: {obj}")
print(f"JSON: {obj.model_dump_json()}")
