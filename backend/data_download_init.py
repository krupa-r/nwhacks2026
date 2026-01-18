## this script is only used once to download required dataset for the pipeline.
# do not run this code more than twice.

import requests
from pathlib import Path

EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

TOPIC_TERMS = {
    "core_scope": [
        "acute care surgery",
        "emergency general surgery",
    ],

    "general_emergency_conditions": [
        "surgical emergency",
        "acute abdomen",
    ],

    "gastrointestinal_emergencies": [
        "acute appendicitis",
        "appendicitis",
        "bowel obstruction",
        "small bowel obstruction",
        "gastrointestinal perforation",
        "perforation",
        "intestinal volvulus",
        "acute mesenteric ischemia",
        "peritonitis",
        "tertiary peritonitis",
    ],

    "trauma_related_emergencies": [
        "blunt trauma",
        "penetrating trauma",
        "exploratory laparotomy",
        "exsanguinating hemorrhage",
        "tension pneumothorax",
        "cardiac tamponade",
    ],

    "cardiovascular_emergencies": [
        "ruptured aortic aneurysm",
        "aortic dissection",
    ],

    "obstetric_gynecologic_emergencies": [
        "ovarian torsion",
        "ectopic pregnancy",
        "bleeding ectopic pregnancy",
    ],

    "genitourinary_emergencies": [
        "testicular torsion",
    ],

    "neurological_emergencies": [
        "acute subdural hematoma",
        "acute epidural hematoma",
    ],

    "vascular_ischemic_emergencies": [
        "limb ischemia",
    ],
}

def build_pubmed_query(terms: list[str]) -> str:
    """
    Build a PubMed TIAB query from a list of terms.
    """
    term_block = " OR ".join(f'"{t}"[TIAB]' for t in terms)
    emergency_block = '(emergency[TIAB] OR emergent[TIAB] OR urgent[TIAB])'
    return f"({term_block}) AND {emergency_block}"


def pubmed_esearch(term: str, retmax: int = 2000) -> list[str]:
    r = requests.get(
        f"{EUTILS}/esearch.fcgi",
        params={"db": "pubmed", "term": term, "retmode": "json", "retmax": retmax},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()["esearchresult"]["idlist"]


def search_by_topics(topic_terms: dict[str, list[str]], retmax: int = 2000):
    """
    Returns:
      {
        topic_name: [pmid1, pmid2, ...]
      }
    """
    results = {}

    for topic, terms in topic_terms.items():
        query = build_pubmed_query(terms)
        pmids = pubmed_esearch(query, retmax=retmax)
        results[topic] = pmids
        print(f"{topic}: {len(pmids)} PMIDs")

    return results


def pubmed_efetch_xml(pmids: list[str], out_path: Path, batch_size: int = 200):
    out_path.parent.mkdir(parents=True, exist_ok=True)

    with open(out_path, "wb") as f:
        f.write(b"<?xml version='1.0' encoding='UTF-8'?>\n<PUBMEDSET>\n")

        for i in range(0, len(pmids), batch_size):
            batch = pmids[i:i+batch_size]
            r = requests.get(
                f"{EUTILS}/efetch.fcgi",
                params={"db": "pubmed", "id": ",".join(batch), "retmode": "xml"},
                timeout=90,
            )
            r.raise_for_status()

            content = r.content
            # remove wrapper if present
            content = content.replace(b"<?xml version='1.0' encoding='UTF-8'?>", b"")
            content = content.replace(b"<PubmedArticleSet>", b"")
            content = content.replace(b"</PubmedArticleSet>", b"")
            f.write(content + b"\n")

        f.write(b"</PUBMEDSET>\n")


BASE_DIR = Path.home() / "Desktop" / "pubmed_data_by_topics"

topic_pmids = search_by_topics(TOPIC_TERMS, retmax=2000)

for topic, pmids in topic_pmids.items():
    if not pmids:
        print(f"{topic}: no results, skipping")
        continue

    out_path = BASE_DIR / topic / "pubmed.xml"
    pubmed_efetch_xml(pmids, out_path)

    print(f"{topic}: saved {len(pmids)} PMIDs → {out_path}")

