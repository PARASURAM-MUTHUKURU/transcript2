try:
    print("Attempting to import app from main...")
    from main import app
    print("Import successful!")
except Exception as e:
    import traceback
    print("IMPORT FAILED!")
    traceback.print_exc()
