import csv
import ast
import requests
import time


#SET THESE VARIABLES BELOW BASED ON YOUR NEEDS

#ENDPOINT
BASE_URL = "http://YourIPHere:2424"  
CREATE_BOOK_ENDPOINT = "/api/admin/create/book"

#Admin Account
USERNAME = "adminDummy"
PASSWORD = "adminPasswordHere"

#CSV location
CSV_PATH = "preprocessed_book_dataset.csv"

#Other configs
DRY_RUN = False          # True doesnt POST, just prints for debugging. False sends POST.
MAX_BOOKS = None         # None = all
SLEEP_BETWEEN = 0.05     # seconds between requests

#-----------------------------------------------------------------------


#Convert the 'genres' CSV cell back into a Python list.
def parse_genres_cell(value):

    if value is None:
        return []

    s = str(value).strip()
    if not s:
        return []

    if s.startswith("[") and s.endswith("]"):
        try:
            parsed = ast.literal_eval(s)
            if isinstance(parsed, list):
                return [str(g).strip() for g in parsed if str(g).strip()]
        except Exception:
            pass

    return [s]

#Build the JSON payload for the /api/admin/create/book endpoint from CSV dict
def build_payload(row):

    # Basic conversions
    title = row.get("title", "").strip()
    author = row.get("author", "").strip()
    isbn = str(row.get("isbn", "")).strip()
    description = row.get("description", "").strip()
    image_url = row.get("imageUrl", "").strip()
    thumb_url = row.get("thumbnailUrl", "").strip()

    # Price
    try:
        price = float(row.get("price", 0.0))
    except Exception:
        price = 0.0

    # Quantity
    try:
        quantity = int(float(row.get("quantity", 0)))
    except Exception:
        quantity = 0

    # Year
    year_val = row.get("year", "")
    year = None
    if year_val not in (None, "", "nan"):
        try:
            year = int(float(year_val))
        except Exception:
            year = None

    genres_list = parse_genres_cell(row.get("genres", ""))

    payload = {
        "title": title,
        "author": author,
        "isbn": isbn,
        "price": price,
        "description": description,
        "imageUrl": image_url,
        "thumbnailUrl": thumb_url,
        "quantity": quantity,
        "year": year if year is not None else 2024,  
        "genres": genres_list,
    }

    return payload


def main():
    url = BASE_URL.rstrip("/") + CREATE_BOOK_ENDPOINT
    print(f"Target URL: {url}")
    print(f"Reading CSV: {CSV_PATH}")

    successes = 0
    failures = 0
    failed_rows = []

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader, start=1):

            if MAX_BOOKS is not None and idx > MAX_BOOKS:
                break

            payload = build_payload(row)

            print(f"\n[{idx}] Uploading: {payload['title']} (ISBN: {payload['isbn']})")
            if DRY_RUN:
                print("  DRY_RUN FOR DEBUGGING, NOT SENDING POST REQ")
                continue

            try:
                resp = requests.post(
                    url,
                    json=payload,
                    auth=(USERNAME, PASSWORD),
                    timeout=10,
                )
            except Exception as e:
                print(f"  Request error: {e}")
                failures += 1
                failed_rows.append((idx, row, str(e)))
                continue

            if resp.status_code in (200, 201):
                print(f"  OK -> status {resp.status_code}")
                successes += 1
            else:
                print(f"  FAILED -> status {resp.status_code}")
                try:
                    print("  Response:", resp.text[:500])
                except Exception:
                    pass
                failures += 1
                failed_rows.append((idx, row, f"status {resp.status_code}: {resp.text[:500]}"))

            time.sleep(SLEEP_BETWEEN)

    print("\nDONE")
    print(f"Successes: {successes}")
    print(f"Failures : {failures}")

    if failed_rows:
        # save failures to a file to inspect later 
        fail_log = "failed_uploads.log"
        with open(fail_log, "w", encoding="utf-8") as out:
            for idx, row, msg in failed_rows:
                out.write(f"Row {idx} failed: {msg}\n")
                out.write(str(row) + "\n\n")
        print(f"Failure details written to {fail_log}")


if __name__ == "__main__":
    main()
