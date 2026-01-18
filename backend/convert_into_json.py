from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET

BASE_DIR = Path.home() / "Desktop" / "pubmed_data_by_topics"
OUT_DIR = BASE_DIR / "processed_json"
OUT_DIR.mkdir(parents=True, exist_ok=True)

PUBMED_ARTICLE_RE = re.compile(r"<PubmedArticle\b.*?</PubmedArticle>", re.DOTALL)

def clean_xml_text(raw: bytes) -> str:
    raw = raw.lstrip(b"\xef\xbb\xbf")
    return raw.decode("utf-8", errors="replace").lstrip()

def text(elem):
    return "".join(elem.itertext()).strip() if elem is not None else ""

def extract_title_abstract(article_elem):
    title = text(article_elem.find(".//ArticleTitle"))

    abstract_parts = []
    for a in article_elem.findall(".//AbstractText"):
        part = text(a)
        if part:
            abstract_parts.append(part)

    abstract = " ".join(abstract_parts)
    return title, abstract

def parse_pubmed_file(xml_file: Path):
    raw_text = clean_xml_text(xml_file.read_bytes())

    # Try streaming parse first
    try:
        for _, elem in ET.iterparse(str(xml_file), events=("end",)):
            if elem.tag == "PubmedArticle":
                yield extract_title_abstract(elem)
                elem.clear()
        return
    except ET.ParseError:
        pass

    # Fallback: regex split
    for m in PUBMED_ARTICLE_RE.finditer(raw_text):
        try:
            article = ET.fromstring(m.group(0))
            yield extract_title_abstract(article)
        except ET.ParseError:
            continue

def preprocess_all_topics():
    for topic_dir in BASE_DIR.iterdir():
        if not topic_dir.is_dir():
            continue
        if topic_dir.name == OUT_DIR.name:
            continue

        records = []

        for xml_file in topic_dir.glob("*.xml"):
            for title, abstract in parse_pubmed_file(xml_file):
                if not (title or abstract):
                    continue
                records.append({
                    "topic": topic_dir.name,
                    "title": title,
                    "abstract": abstract
                })

        out_path = OUT_DIR / f"{topic_dir.name}.json"
        with out_path.open("w", encoding="utf-8") as f:
            json.dump(records, f, ensure_ascii=False, indent=2)

        print(f"[OK] {topic_dir.name}: {len(records)} records → {out_path}")

if __name__ == "__main__":
    preprocess_all_topics()
