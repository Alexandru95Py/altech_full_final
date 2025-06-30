import os
import tempfile
import subprocess
from django.core.files import File as DjangoFile

def compress_pdf(uploaded_file, compression_level, retain_image_quality=False, remove_metadata=False):
    quality_map = {
        "low": "/screen",
        "medium": "/ebook",
        "high": "/printer",
    }
    gs_quality = quality_map.get(compression_level, "/ebook")

    GHOSTSCRIPT_PATH = r"C:\Users\oanap\Desktop\my-app\aplicatii programare\gs10.05.1\bin\gswin64c.exe"

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_in:
        temp_input_path = temp_in.name
        for chunk in uploaded_file.chunks():
            temp_in.write(chunk)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_out:
        temp_output_path = temp_out.name

    downsample_options = [
        "-dDownsampleColorImages=true",
        "-dColorImageResolution=72",
        "-dDownsampleGrayImages=true",
        "-dGrayImageResolution=72",
        "-dDownsampleMonoImages=true",
        "-dMonoImageResolution=72",
    ]

    command = [
        GHOSTSCRIPT_PATH,
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        f"-dPDFSETTINGS={gs_quality}",
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        f"-sOutputFile={temp_output_path}",
        temp_input_path,
    ] + (downsample_options if not retain_image_quality else [])

    try:
        subprocess.run(command, check=True)
    except Exception as e:
        raise RuntimeError(f"Compression failed: {e}")

    original_size = os.path.getsize(temp_input_path)
    compressed_size = os.path.getsize(temp_output_path)

    print(f"🟡 Compression level: {compression_level}")
    print(f"📁 Original size: {original_size / 1024:.2f} KB")
    print(f"📉 Compressed size: {compressed_size / 1024:.2f} KB")

    if compressed_size >= original_size:
        print("⚠️ Compresia nu a fost eficientă. Returnăm fișierul original.")
        return DjangoFile(open(temp_input_path, "rb"), name=os.path.basename(temp_input_path)), original_size, original_size

    compressed_django_file = DjangoFile(open(temp_output_path, "rb"), name=os.path.basename(temp_output_path))
    return compressed_django_file, original_size, compressed_size