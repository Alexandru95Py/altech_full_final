from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from reportlab.lib import colors
import tempfile
import json


def generate_cv_pdf(data, photo_path=None):
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    c = canvas.Canvas(temp_file.name, pagesize=A4)

    width, height = A4
    margin_x = 2 * cm
    y = height - 2 * cm
    line_spacing = 16

    # ✅ Nume complet
    c.setFont("Helvetica-Bold", 18)
    full_name = f"{data.get('first_name', '')} {data.get('last_name', '')}".strip() or "Unknown Name"
    c.drawString(margin_x, y, full_name)
    y -= 40

    # ✅ Poză profil
    if photo_path:
        try:
            photo_width = 120
            photo_height = 120
            c.drawImage(photo_path, width - margin_x - photo_width, height - 2 * cm - photo_height,
                        width=photo_width, height=photo_height, preserveAspectRatio=True, mask='auto')
        except Exception as e:
            print("Error adding photo:", e)

    # ✅ Contact Info
    c.setFont("Helvetica", 11)
    contact_lines = []
    if data.get("email"):
        contact_lines.append(f"Email: {data['email']}")
    if data.get("phone"):
        contact_lines.append(f"Phone: {data['phone']}")
    if data.get("linkedin_url"):
        contact_lines.append(f"LinkedIn: {data['linkedin_url']}")
    if data.get("website_url"):
        contact_lines.append(f"Website: {data['website_url']}")

    for line in contact_lines:
        c.drawString(margin_x, y, line)
        y -= 60

    # Separator
    y -= 8
    c.setLineWidth(0.5)
    c.setStrokeColor(colors.grey)
    c.line(margin_x, y, width - margin_x, y)
    y -= 12

    # 🔻 Spațiu suplimentar pentru a nu se suprapune cu poza
    y -= 80

    def draw_section(title, content):
        nonlocal y
        if not content or not str(content).strip():
            return

        # Prelucrare listă JSON dacă este cazul
        try:
            if isinstance(content, str) and content.strip().startswith("["):
                parsed = json.loads(content)
                if isinstance(parsed, list):
                    lines = []
                    for item in parsed:
                        if isinstance(item, dict):
                            if title == "Work Experience":
                                job = item.get("job_title", "Unknown Job")
                                company = item.get("company", "Unknown Company")
                                lines.append(f"{job} – {company}")
                                respons = item.get("responsibilities", "")
                                for r in respons.split("\n"):
                                    lines.append(f"{r.strip()}")  # fără bullet
                            elif "name" in item and "proficiency" in item:
                                lines.append(f"{item['name'].capitalize()} – {item['proficiency']}")
                            elif "title" in item and "organization" in item:
                                lines.append(f"{item['title']} at {item['organization']}")
                            elif "degree" in item and "institution" in item:
                                lines.append(f"{item['degree']} – {item['institution']}")
                            else:
                                lines.append(f"{json.dumps(item)}")
                        else:
                            lines.append(f"{str(item)}")  # fără -
                    content = "\n".join(lines)
        except Exception as e:
            print(f"⚠️ JSON parse error in section {title}: {e}")

        # Titlul secțiunii
        c.setFont("Helvetica-Bold", 13)
        c.setFillColor(colors.darkblue)
        if y < 80:
            c.showPage()
            y = height - 2 * cm
        c.drawString(margin_x, y, title.upper())
        y -= 20
        c.setFillColor(colors.black)
        c.setFont("Helvetica", 11)

        for line in str(content).split('\n'):
            if y < 50:
                c.showPage()
                y = height - 2 * cm
            c.drawString(margin_x + 10, y, line.strip())
            y -= line_spacing

        # Separator + spațiu extra între secțiuni
        y -= 6
        c.setLineWidth(0.5)
        c.setStrokeColor(colors.grey)
        c.line(margin_x, y, width - margin_x, y)
        y -= 16  # ⬅️ distanță mai mare între secțiuni

    # ✅ Secțiuni afișate complet
    draw_section("Professional Summary", data.get("professional_summary", ""))
    draw_section("Education", data.get("education", ""))
    draw_section("Work Experience", data.get("work_experience", ""))
    draw_section("Skills", data.get("skills", ""))
    draw_section("Languages", data.get("languages", ""))
    draw_section("Certifications", data.get("certifications", ""))
    draw_section("Useful Links", data.get("links", ""))

    c.showPage()
    c.save()
    return temp_file.name