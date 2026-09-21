import fitz  # PyMuPDF
import cv2
import numpy as np
import re

# Les valeurs déjà présentes (dates, montants, numéros) ne sont pas modifiées.
# L'application ne détecte automatiquement que les zones vides et les cases à cocher.

DATE_NUMERIC_PATTERN = r'\b(?:\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}|\d{4}[/.\-]\d{1,2}[/.\-]\d{1,2})\b'

DATE_FR_PATTERN = (
    r'\b(?:1er|[0-9]{1,2})\s+'
    r'(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)'
    r'(?:\s+\d{4})?\b'
)

DATE_EN_PATTERN = (
    r'\b(?:january|february|march|april|may|june|july|august|september|october|november|december|'
    r'jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)'
    r'[\s.]*\d{1,2}(?:st|nd|rd|th)?[,\s]+\d{4}\b'
    r'|\b\d{1,2}(?:st|nd|rd|th)?\s+'
    r'(?:january|february|march|april|may|june|july|august|september|october|november|december|'
    r'jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)'
    r'[\s,]+\d{4}\b'
)

NUMBER_PATTERN = r'\b\d{1,3}(?:[ \.,]\d{3})*(?:[\.,]\d{2})?\b(?:[\s]?(?:€|\$|USD|EUR))?'
EMAIL_PATTERN  = r'\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,7}\b'

# Keywords that indicate a date field label (case-insensitive)
DATE_LABEL_KEYWORDS = [
    r'date\s*:?',
    r'dated?\s+(?:on|of|from|le|du|au)?\s*:?',
    r'birthdate\s*:?',
    r'date\s+of\s+birth\s*:?',
    r'date\s+de\s+naissance\s*:?',
    r'naissance\s*:?',
    r'né\s*(?:le|le\s*:)?',
    r'insured\s+as?\s+from\s+(?:the)?\s*:?',
    r'assuré\s*(?:à|depuis|à partir)?\s*(?:le|du|de)?\s*:?',
    r'signed?\s+(?:on|at)?\s*:?',
    r'signé\s*(?:le|à)?\s*:?',
    r'expir(?:y|ation|e)\s*(?:date)?\s*:?',
    r'valid\s+(?:until|from|through|to)\s*:?',
    r'effective\s*(?:date)?\s*:?',
    r'à\s+partir\s+du\s*:?',
    r'en\s+vigueur\s+(?:le|du|à partir)?\s*:?',
    r'period\s*:?',
    r'période\s*:?',
    r'from\s*:?',
    r'to\s*:?\s+(?=\d)',
    r'du\s*:?',
    r'au\s*:?',
]

DATE_LABEL_RE = re.compile(
    r'(?:' + '|'.join(DATE_LABEL_KEYWORDS) + r')',
    re.IGNORECASE
)


def extract_dates(text: str) -> list[str]:
    found = set()
    for pattern in [DATE_NUMERIC_PATTERN, DATE_FR_PATTERN, DATE_EN_PATTERN]:
        for m in re.finditer(pattern, text, re.IGNORECASE):
            found.add(m.group(0).strip())
    return list(found)


def is_overlapping(box1, box2):
    x1, y1, w1, h1 = box1
    x2, y2, w2, h2 = box2
    if x1 + w1 < x2 or x2 + w2 < x1: return False
    if y1 + h1 < y2 or y2 + h2 < y1: return False
    return True


def find_date_fields_from_labels(page, page_num: int, page_w: int, page_h: int) -> list[dict]:
    """
    Scan text words for date-label keywords.
    For each found label, look to the right (same line) or below for blank space
    and create a 'date' type field at that position.
    """
    date_fields = []
    today = ""  # empty default — user will pick the date

    # get_text("rawdict") gives blocks > lines > spans > chars with bboxes
    blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]

    for block in blocks:
        if block.get("type") != 0:  # 0 = text block
            continue
        for line in block.get("lines", []):
            # Reconstruct line text and spans with positions
            spans = line.get("spans", [])
            if not spans:
                continue

            line_text = " ".join(s["text"] for s in spans)
            line_bbox = line["bbox"]  # (x0, y0, x1, y1)

            m = DATE_LABEL_RE.search(line_text)
            if not m:
                continue

            # Find the span that contains the end of the matched label
            match_end_char = m.end()
            char_count = 0
            label_x1 = line_bbox[0]  # fallback

            for span in spans:
                span_len = len(span["text"]) + 1  # +1 for the space we added
                if char_count + span_len >= match_end_char:
                    label_x1 = span["bbox"][2]  # right edge of label span
                    break
                char_count += span_len

            # Check if there's meaningful content after the label on the same line
            text_after_label = line_text[m.end():].strip()

            # If the remaining text is already a date value → skip (already filled)
            already_has_date = bool(re.search(
                DATE_NUMERIC_PATTERN + '|' + DATE_FR_PATTERN + '|' + DATE_EN_PATTERN,
                text_after_label, re.IGNORECASE
            ))
            if already_has_date:
                continue

            # Determine field placement
            line_h = line_bbox[3] - line_bbox[1]
            field_h = max(line_h, page_h * 0.025)

            if text_after_label == "" or len(text_after_label) <= 3:
                # Blank area to the right of the label on the same line
                field_x = label_x1 + 4
                field_y = line_bbox[1]
                field_w = max((line_bbox[2] - field_x), page_w * 0.12)
            else:
                # There's some non-date text after label, skip to avoid false positives
                continue

            # Convert to percentages
            date_fields.append({
                "type": "date",
                "pageIndex": page_num,
                "x": max(0, (field_x / page_w) * 100),
                "y": max(0, (field_y / page_h) * 100),
                "width": min(((field_w) / page_w) * 100, 40),
                "height": (field_h / page_h) * 100,
                "box": (int(field_x), int(field_y), int(field_w), int(field_h)),
            })

    return date_fields


def process_pdf(file_path: str):
    results = {
        "fields": []
    }

    doc = fitz.open(file_path)

    for page_num in range(len(doc)):
        page = doc[page_num]
        page_rect = page.rect  # width/height in pt

        # --- Computer Vision (OpenCV) at 150 DPI ---
        pix = page.get_pixmap(dpi=150)
        scale_x = pix.w / page_rect.width   # pt → px conversion
        scale_y = pix.h / page_rect.height

        img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
        if pix.n >= 3:
            gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY) if pix.n == 3 else cv2.cvtColor(img, cv2.COLOR_RGBA2GRAY)
        else:
            gray = img.squeeze()

        _, thresh = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)

        detected_boxes = []

        # -- Horizontal lines → generic text fields --
        horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
        detect_horizontal = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horizontal_kernel, iterations=2)
        contours_lines, _ = cv2.findContours(detect_horizontal, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for cnt in contours_lines:
            x, y, w, h = cv2.boundingRect(cnt)
            if w > 40:
                field_h = int(pix.h * 0.02)
                field_y = max(0, y - field_h + h)
                detected_boxes.append({
                    "type": "text",
                    "pageIndex": page_num,
                    "x": (x / pix.w) * 100,
                    "y": (field_y / pix.h) * 100,
                    "width": (w / pix.w) * 100,
                    "height": (field_h / pix.h) * 100,
                    "box": (x, field_y, w, field_h)
                })

        # -- Checkboxes --
        contours_all, _ = cv2.findContours(thresh, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours_all:
            x, y, w, h = cv2.boundingRect(cnt)
            area = cv2.contourArea(cnt)
            if 50 < area < 800:
                aspect_ratio = w / float(h) if h != 0 else 0
                if 0.8 <= aspect_ratio <= 1.2:
                    detected_boxes.append({
                        "type": "checkbox",
                        "pageIndex": page_num,
                        "x": (x / pix.w) * 100,
                        "y": (y / pix.h) * 100,
                        "width": (w / pix.w) * 100,
                        "height": (h / pix.h) * 100,
                        "box": (x, y, w, h)
                    })

        # Deduplicate text fields and checkboxes that overlap.
        final_fields = []
        for d in detected_boxes:
            overlap = False
            for f in final_fields:
                if is_overlapping(d["box"], f["box"]):
                    overlap = True
                    break
            if not overlap:
                final_fields.append(d)

        for f in final_fields:
            f.pop("box", None)

        results["fields"].extend(final_fields)

    doc.close()
    return results
