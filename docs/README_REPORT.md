# Generating the QuizMaster Project Report PDF

This document explains how to generate `QuizMaster-Project-Report.pdf` from the source Markdown file `docs/REPORT.md`, both **locally** and **via GitHub Actions**.

---

## Report source file

| File | Description |
|---|---|
| `docs/REPORT.md` | Full project report in Markdown (edit this to update the report) |
| `QuizMaster-Project-Report.pdf` | Generated PDF (created by CI or locally — not committed to the repo) |

---

## Generating the PDF locally

### Prerequisites

Install the following tools on your machine:

| Tool | Install command |
|---|---|
| **Pandoc** | `sudo apt-get install pandoc` (Linux) / `brew install pandoc` (macOS) / [pandoc.org](https://pandoc.org/installing.html) (Windows) |
| **wkhtmltopdf** | `sudo apt-get install wkhtmltopdf` (Linux) / [wkhtmltopdf.org](https://wkhtmltopdf.org/downloads.html) (macOS/Windows) |

### Step 1 — Convert Markdown to HTML

```bash
pandoc docs/REPORT.md \
  --from=markdown+yaml_metadata_block \
  --to=html5 \
  --standalone \
  --metadata title="QuizMaster Project Report" \
  --css=https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown-light.min.css \
  -o /tmp/report.html
```

### Step 2 — Convert HTML to PDF

```bash
wkhtmltopdf \
  --enable-local-file-access \
  --page-size A4 \
  --margin-top 20mm \
  --margin-right 20mm \
  --margin-bottom 20mm \
  --margin-left 20mm \
  --encoding UTF-8 \
  --title "QuizMaster Project Report" \
  --footer-center "Page [page] of [topage]" \
  --footer-font-size 9 \
  /tmp/report.html \
  QuizMaster-Project-Report.pdf
```

The PDF will be created as `QuizMaster-Project-Report.pdf` in your current directory.

> **Linux headless note**: If you get an `X server` error, prefix both commands with `xvfb-run --auto-servernum`:
> ```bash
> xvfb-run --auto-servernum wkhtmltopdf ...
> ```

---

## Generating the PDF via GitHub Actions

The workflow file is located at:

```
.github/workflows/generate-pdf-report.yml
```

### When the workflow runs

The PDF generation workflow triggers automatically when:

- A **push to `main`** includes changes to `docs/REPORT.md`.
- The workflow is **manually triggered** via the GitHub Actions UI (workflow_dispatch).

### How to trigger manually

1. Go to the repository on GitHub: <https://github.com/maviyaattar/Quiz-Master>
2. Click the **Actions** tab.
3. In the left sidebar, click **Generate PDF Report**.
4. Click **Run workflow** → select the `main` branch → click **Run workflow**.

### Where to find the PDF artifact

After the workflow completes:

1. Go to the **Actions** tab on GitHub.
2. Click the latest **Generate PDF Report** run.
3. Scroll to the **Artifacts** section at the bottom.
4. Click **QuizMaster-Project-Report** to download the ZIP archive containing the PDF.

Artifacts are retained for **90 days** by default.

---

## Updating the report

To update the report content:

1. Edit `docs/REPORT.md`.
2. Commit and push to `main`.
3. The GitHub Actions workflow will automatically regenerate the PDF.
4. Download the new PDF from the **Artifacts** section of the latest Actions run.

---

## Report sections

The report (`docs/REPORT.md`) covers:

1. Cover Page
2. Abstract
3. Objectives
4. Key Features
5. Screenshots (Landing, Auth, Join pages)
6. Tech Stack
7. System Architecture
8. Module / Page Descriptions (all 10 HTML pages)
9. Security
10. Accessibility
11. Testing Checklist
12. Future Scope
13. Conclusion
14. References

---

*For questions or issues, open a GitHub issue at <https://github.com/maviyaattar/Quiz-Master/issues>.*
