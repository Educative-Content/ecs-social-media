
import os
import boto3
from botocore.config import Config

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
_ddb = boto3.resource("dynamodb", region_name=AWS_REGION, config=Config(retries={'max_attempts': 10, 'mode': 'standard'}))

def table(name: str):
    return _ddb.Table(name)
