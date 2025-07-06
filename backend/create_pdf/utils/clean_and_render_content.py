from bs4 import BeautifulSoup
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.pdfbase.pdfmetrics import stringWidth
from html.parser import HTMLParser


def clean_and_render_content(html, c, y_start):
    """
    Improved HTML-to-ReportLab renderer for basic tags and alignment.
    Supports: <h1>, <h2>, <b>, <strong>, <i>, <em>, <p>, <div>, <br>, <span style="text-align:">, <center>, <ul>, <ol>, <li>
    """
    class SimpleHTMLParser(HTMLParser):
        def __init__(self, canvas, y):
            super().__init__()
            self.c = canvas
            self.y = y
            self.font_stack = [("Helvetica", 14, False, False)]  # (font, size, bold, italic)
            self.align_stack = [TA_LEFT]
            self.leading = 20
            self.in_list = False
            self.list_type = None
            self.list_idx = 0

        def handle_starttag(self, tag, attrs):
            style = dict(attrs)
            if tag in ("b", "strong"):
                font, size, bold, italic = self.font_stack[-1]
                self.font_stack.append((font, size, True, italic))
            elif tag in ("i", "em"):
                font, size, bold, italic = self.font_stack[-1]
                self.font_stack.append((font, size, bold, True))
            elif tag == "h1":
                self.font_stack.append(("Helvetica-Bold", 22, True, False))
                self.align_stack.append(TA_CENTER)
            elif tag == "h2":
                self.font_stack.append(("Helvetica-Bold", 18, True, False))
                self.align_stack.append(TA_CENTER)
            elif tag == "p":
                self.align_stack.append(TA_LEFT)
            elif tag == "center":
                self.align_stack.append(TA_CENTER)
            elif tag == "div":
                align = style.get("style", "")
                if "text-align:center" in align:
                    self.align_stack.append(TA_CENTER)
                elif "text-align:right" in align:
                    self.align_stack.append(TA_RIGHT)
                else:
                    self.align_stack.append(TA_LEFT)
            elif tag == "ul":
                self.in_list = True
                self.list_type = "ul"
                self.list_idx = 0
            elif tag == "ol":
                self.in_list = True
                self.list_type = "ol"
                self.list_idx = 1
            elif tag == "li":
                pass

        def handle_endtag(self, tag):
            if tag in ("b", "strong", "i", "em", "h1", "h2"):
                self.font_stack.pop()
            elif tag in ("p", "center", "div"):
                self.align_stack.pop()
            elif tag in ("ul", "ol"):
                self.in_list = False
                self.list_type = None
                self.list_idx = 0

        def handle_data(self, data):
            font, size, bold, italic = self.font_stack[-1]
            align = self.align_stack[-1]
            if bold and italic:
                font = "Helvetica-BoldOblique"
            elif bold:
                font = "Helvetica-Bold"
            elif italic:
                font = "Helvetica-Oblique"
            else:
                font = "Helvetica"
            self.c.setFont(font, size)
            # List bullets
            if self.in_list and self.list_type == "ul":
                data = u"• " + data
            elif self.in_list and self.list_type == "ol":
                data = f"{self.list_idx}. " + data
                self.list_idx += 1
            # Alignment
            width = stringWidth(data, font, size)
            x = 100
            if align == TA_CENTER:
                x = (self.c._pagesize[0] - width) / 2
            elif align == TA_RIGHT:
                x = self.c._pagesize[0] - width - 100
            # Draw
            self.c.drawString(x, self.y, data)
            self.y -= self.leading

        def handle_startendtag(self, tag, attrs):
            if tag == "br":
                self.y -= self.leading

    parser = SimpleHTMLParser(c, y_start)
    parser.feed(html)
    return parser.y
