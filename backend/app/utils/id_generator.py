import random
import string

def generate_private_id() -> str:
    """
    Génère un ID privé unique au format private-XXXXX-XXXX
    où X est un caractère alphanumérique aléatoire
    """
    # Générer des segments aléatoires
    segment1 = ''.join(random.choices(string.ascii_letters + string.digits, k=5))
    segment2 = ''.join(random.choices(string.ascii_letters + string.digits, k=4))
    
    # Assembler l'ID privé
    return f"private-{segment1}-{segment2}"

def generate_public_id() -> str:
    """
    Génère un ID public unique au format public-XXXXX-XXXX-XXXX
    où X est un caractère alphanumérique aléatoire
    """
    # Générer des segments aléatoires
    segment1 = ''.join(random.choices(string.ascii_letters + string.digits, k=5))
    segment2 = ''.join(random.choices(string.ascii_letters + string.digits, k=4))
    segment3 = ''.join(random.choices(string.ascii_letters + string.digits, k=4))
    
    # Assembler l'ID public
    return f"public-{segment1}-{segment2}-{segment3}"

# Garder la fonction originale pour la compatibilité avec le code existant
def generate_product_uuid() -> str:
    """
    Génère un UUID unique au format product-XXXXX-XXXX-XXXX-XXXXXX
    où X est un caractère alphanumérique aléatoire
    """
    # Générer des segments aléatoires
    segment1 = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
    segment2 = ''.join(random.choices(string.ascii_letters + string.digits, k=4))
    segment3 = ''.join(random.choices(string.ascii_letters + string.digits, k=4))
    segment4 = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
    
    # Assembler l'UUID
    return f"product-{segment1}-{segment2}-{segment3}-{segment4}"
