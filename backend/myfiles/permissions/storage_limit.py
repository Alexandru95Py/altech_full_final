# myfiles/utils/storage_limit.py

# Limite pentru planul Free
FREE_MAX_FILE_COUNT = 20        # maxim 5 fișiere per utilizator
FREE_MAX_FILE_SIZE_MB = 5      # maxim 5 MB per fișier

# Limite pentru planul Pro
PRO_MAX_FILE_COUNT = 50        # maxim 50 fișiere
PRO_MAX_FILE_SIZE_MB = 50      # maxim 50 MB

# Utilitare (opțional)
def get_limits_by_plan(plan: str):
    if plan == 'pro':
        return PRO_MAX_FILE_COUNT, PRO_MAX_FILE_SIZE_MB
    return FREE_MAX_FILE_COUNT, FREE_MAX_FILE_SIZE_MB
