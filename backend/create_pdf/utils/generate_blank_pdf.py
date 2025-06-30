import os
from reportlab.pdfgen import canvas

def create_blank_pdf():
    # Obține folderul absolut în care se află acest fișier
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # Creează calea absolută către folderul 'assets'
    assets_dir = os.path.abspath(os.path.join( 'create_pdf', 'tests', 'assets', 'test_document.pdf'))
    os.makedirs(assets_dir, exist_ok=True)  # Creează folderul dacă nu există

    pdf_path = os.path.join(assets_dir, 'test_document.pdf')
    print(f"[INFO] Creez PDF la: {pdf_path}")

    c = canvas.Canvas(pdf_path)
    c.showPage()
    c.save()

    print("[SUCCESS] PDF gol creat!")

if __name__ == "_main_":
    create_blank_pdf()