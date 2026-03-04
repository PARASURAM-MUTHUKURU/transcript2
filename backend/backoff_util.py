import time
import random
from functools import wraps
from google.api_core import exceptions

def exponential_backoff(max_retries=5, initial_delay=1, backoff_factor=2, jitter=True):
    """
    Decorator for exponential backoff on 429 errors.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            retry_count = 0
            delay = initial_delay
            
            while retry_count <= max_retries:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    # Check for 429
                    error_msg = str(e).lower()
                    if "429" in error_msg or "quota" in error_msg:
                        if retry_count == max_retries:
                            print(f"[Backoff] Max retries ({max_retries}) reached. Failing.")
                            raise e
                        
                        # Calculate wait time
                        wait_time = delay * (backoff_factor ** retry_count)
                        if jitter:
                            wait_time += random.uniform(0, 1)
                        
                        print(f"[Backoff] Hit quota limit (429). Retrying in {wait_time:.2f}s... (Attempt {retry_count + 1}/{max_retries})")
                        time.sleep(wait_time)
                        retry_count += 1
                    else:
                        # Re-raise non-429 errors
                        raise e
            return func(*args, **kwargs)
        return wrapper
    return decorator

def async_exponential_backoff(max_retries=5, initial_delay=1, backoff_factor=2, jitter=True):
    """
    Decorator for async exponential backoff on 429 errors.
    """
    import asyncio
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            retry_count = 0
            delay = initial_delay
            
            while retry_count <= max_retries:
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    error_msg = str(e).lower()
                    if "429" in error_msg or "quota" in error_msg:
                        if retry_count == max_retries:
                            print(f"[Async Backoff] Max retries ({max_retries}) reached. Failing.")
                            raise e
                        
                        wait_time = delay * (backoff_factor ** retry_count)
                        if jitter:
                            wait_time += random.uniform(0, 1)
                        
                        print(f"[Async Backoff] Hit quota limit (429). Retrying in {wait_time:.2f}s... (Attempt {retry_count + 1}/{max_retries})")
                        await asyncio.sleep(wait_time)
                        retry_count += 1
                    else:
                        raise e
            return await func(*args, **kwargs)
        return wrapper
    return decorator
