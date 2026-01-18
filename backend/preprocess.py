## this script is to update the dataset in rag implementations from pmc sub-dataset.
## only run this script to download and update the dataset

from pathlib import Path
import json
import xml.etree.ElementTree as ET

BASE_DIR = Path.home() / "Desktop" / "pubmed_data_by_topics"

def extract_text(element):
    """Recursively extract text including nested tags"""
    if element is None:
        return ""
    return "".join(element.itertext()).strip()

def preprocess_data(base_dir: Path = BASE_DIR):
    results = []

    if not base_dir.is_dir():
        print(f"[WARN] BASE_DIR not found: {base_dir}")
        return results
    for topic in base_dir.iterdir():
        if not topic.is_dir():
            continue
        for xml_file in topic.glob("*.xml"):
            try:
                tree = ET.parse(xml_file)
                root = tree.getroot()

                # Article Title
                title_elem = root.find(".//ArticleTitle")
                title = extract_text(title_elem)

                # Abstract Text (can be multiple)
                abstract_elems = root.findall(".//AbstractText")
                abstract = " ".join(
                    extract_text(elem) for elem in abstract_elems
                )

                if title or abstract:
                    results.append({
                        "topic": topic.name,
                        "file": xml_file.name,
                        "title": title,
                        "abstract": abstract
                    })

            except ET.ParseError as e:
                print(f"[ERROR] XML parse failed: {xml_file} → {e}")

    return results


def save_results_to_json(data: list[dict], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
if __name__ == "__main__":
    results = preprocess_data(BASE_DIR)
    out_file = BASE_DIR / "processed.json"
    save_results_to_json(results, out_file)
    print(f"[OK] Saved {len(results)} records → {out_file}")