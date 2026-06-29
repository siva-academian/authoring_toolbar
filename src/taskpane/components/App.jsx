import React, { useState, useRef } from "react";
import "./App.css";

const COMPONENTS = [
  {
    id: "lesson-number",
    label: "Lesson Number",
    description: "e.g.  LESSON 1",
    preview: "LESSON 03",
    category: "header",
  },
  {
    id: "lesson-title",
    label: "Lesson Title",
    description: "e.g.  Introduction to Biology",
    preview: "Introduction to Biology",
    category: "header",
  },
  {
    id: "chapter-overview",
    label: "Chapter Overview",
    description: "CHAPTER OUTLINE label",
    preview: "CHAPTER OUTLINE",
    category: "text-media",
  },
  {
    id: "topic",
    label: "Topic",
    description: "e.g.  1.1 Topic Title",
    preview: "Introduction to Biology",
    category: "text-media",
  },
  {
    id: "section-title",
    label: "Section Title",
    description: "e.g.  1.1 Themes and Concepts of Biology",
    preview: "1.1 Themes and Concepts of Biology",
    category: "header",
  },
  {
    id: "logo-with-text",
    label: "Logo with Text",
    description: "Small logo + editable learning link text",
    preview: "logo  Start typing...",
    category: "header",
  },
  {
    id: "text",
    label: "Text",
    description: "Normal body text, Arial 11pt",
    preview: "Start typing your text here...",
    category: "text-media",
  },
  {
    id: "figure-image",
    label: "Image",
    description: "Upload image + FIGURE caption",
    preview: null,
    category: "text-media",
  },
  {
    id: "figure-caption",
    label: "Caption",
    description: "e.g.  FIGURE 1.1 Description…",
    preview: "caption",
    previewPrefix: "FIGURE 1.1",
    category: "text-media",
  },
];

const REACT_APP_TENANT_ID = "4379b1c922fe47a3bb96e7786b412bb4";
const REACT_APP_BACKEND_BASE_URL = "https://api-prjx.academian.com";
const REACT_APP_WEB_BASE_URL = "https://prjx.academian.com";

// Pen icon SVG for the logo
const PenIcon = () => (
  <svg width="30" height="50" viewBox="0 0 83 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M33.4173 21.0732L23.4127 39.9851L31.7005 42.6607L32.3017 42.855L42.389 46.1115L40.2309 52.9831L30.1436 49.7266L29.5424 49.5322L15.621 44.8198C19.2297 38.1942 33.4173 21.0732 33.4173 21.0732ZM23.432 69.4888C26.8786 70.6011 28.7715 74.2978 27.6581 77.7443C26.6735 80.7947 23.665 82.6274 20.5965 82.2366L17.5891 91.553L14.3455 101.6L9.60731 116.278C18.8345 103.706 29.9332 92.5096 42.8367 82.6425C38.8952 73.2402 37.7582 63.8852 39.5996 54.5807L29.5746 51.3446L29.0603 51.1782L19.0353 47.9421C15.0874 56.567 8.69576 63.4912 0 68.8134C4.69843 84.3647 7.15502 99.9352 7.28923 115.53L12.0274 100.853L15.271 90.8057L18.2784 81.4893C15.5609 80.0119 14.1919 76.7662 15.1765 73.7159C16.2888 70.2693 19.9855 68.3764 23.432 69.4899V69.4888Z" fill="#09D3FF" />
    <path fillRule="evenodd" clipRule="evenodd" d="M83 -40C65.9145 -20.911 43.8256 31.5652 44.2916 54.5721L35.1879 51.3543C39.9475 5.8441 83 -40 83 -40Z" fill="#09D3FF" />
  </svg>
);

// Three-dot menu icon
const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="3" r="1.2" fill="#888" />
    <circle cx="8" cy="8" r="1.2" fill="#888" />
    <circle cx="8" cy="13" r="1.2" fill="#888" />
  </svg>
);

const renderComponentCard = ({ comp, loading, handleCardClick }) => {
  if (!comp || comp.id === "figure-image" || comp.id === "logo-with-text") return null;
  const isActive = loading === comp.id;

  return (
    <button
      key={comp.id}
      className={`component-card${isActive ? " component-card--loading" : ""}`}
      onClick={() => handleCardClick(comp.id)}
      disabled={!!loading}
      aria-label={`Insert ${comp.label}`}
    >
      <div className="component-card-top">
        <span className="component-card-label">
          {isActive ? "Inserting…" : comp.label}
        </span>
        <span className="component-card-dots" onClick={(e) => e.stopPropagation()}>
          <DotsIcon />
        </span>
      </div>
      {comp.preview && (
        <div className="component-card-preview-box">
          {comp.previewPrefix ? (
            <span className="component-card-preview">
              <span className="preview-figure-label">{comp.previewPrefix} </span>
              <span className="preview-figure-text">{comp.preview}</span>
            </span>
          ) : (
            <span className="component-card-preview">{comp.preview}</span>
          )}
        </div>
      )}
    </button>
  );
};

export default function App() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("content"); // "content" | "image"
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [linkImageFile, setLinkImageFile] = useState(null);
  const [linkImagePreview, setLinkImagePreview] = useState(null);
  const linkFileInputRef = useRef(null);
  const [apiLoadingStatus, setApiLoadingStatus] = useState(false);
  const [apiType, setApiType] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");
  const userInfoRef = useRef({ tenantId: REACT_APP_TENANT_ID });

  React.useEffect(() => {
    let docId = Office?.context?.document?.settings.get("appDocId");
    if (!docId) {
      docId = crypto.randomUUID();
      Office?.context?.document?.settings.set("appDocId", docId);
      Office?.context?.document?.settings.saveAsync();
    }
  }, []);

  const log = (msg) =>
    setDebugInfo(
      (prev) =>
        `${new Date().toLocaleTimeString()}: ${typeof msg === "object" ? JSON.stringify(msg) : msg
        }\n` + prev
    );

  const handleCardClick = async (id) => {
    if (id === "figure-image") {
      setActiveTab("image");
      setStatus("");
      return;
    }
    if (id === "logo-with-text") {
      linkFileInputRef.current?.click();
      setStatus("");
      return;
    }
    setLoading(id);
    setStatus("");
    try {
      await insertComponent(id);
      setStatus(`✓ "${COMPONENTS.find((c) => c.id === id)?.label}" inserted.`);
    } catch (err) {
      setStatus(`✗ Error: ${err.message || "Something went wrong."}`);
    } finally {
      setLoading(null);
      setTimeout(() => setStatus(""), 2000);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleLinkImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("âœ— Please select an image file.");
      return;
    }
    setLinkImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLinkImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleLinkToLearningInsert = async () => {
    if (!linkImageFile) {
      setStatus("âœ— Please upload a Logo with Text image first.");
      return;
    }
    setLoading("logo-with-text");
    setStatus("");
    try {
      const base64 = await fileToBase64(linkImageFile);
      await insertLinkToLearning(base64);
      setStatus("âœ“ Logo with Text inserted.");
      setLinkImageFile(null);
      setLinkImagePreview(null);
      if (linkFileInputRef.current) linkFileInputRef.current.value = "";
    } catch (err) {
      setStatus(`âœ— Error: ${err.message || "Logo with Text insert failed."}`);
    } finally {
      setLoading(null);
      setTimeout(() => setStatus(""), 2000);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("✗ Please drop an image file.");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleImageInsert = async () => {
    if (!imageFile) {
      setStatus("✗ Please select an image first.");
      return;
    }
    setLoading("figure-image");
    setStatus("");
    try {
      const base64 = await fileToBase64(imageFile);
      await insertFigureImage(base64);
      setStatus("✓ Figure image inserted.");
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      setStatus(`✗ Error: ${err.message || "Image insert failed."}`);
    } finally {
      setLoading(null);
      setTimeout(() => setStatus(""), 2000);
    }
  };

  const DOCX_MIME =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  function getCurrentWordFile() {
    return new Promise((resolve, reject) => {
      Office?.context?.document?.getFileAsync(
        Office.FileType.Compressed,
        { sliceSize: 4 * 1024 * 1024 },
        (result) => {
          if (result.status !== Office.AsyncResultStatus.Succeeded) {
            reject(result.error);
            return;
          }
          const officeFile = result.value;
          const chunks = [];
          let sliceIndex = 0;
          const getNextSlice = () => {
            officeFile.getSliceAsync(sliceIndex, (sliceResult) => {
              if (sliceResult.status !== Office.AsyncResultStatus.Succeeded) {
                officeFile.closeAsync();
                reject(sliceResult.error);
                return;
              }
              chunks.push(new Uint8Array(sliceResult.value.data));
              sliceIndex += 1;
              if (sliceIndex < officeFile.sliceCount) {
                getNextSlice();
              } else {
                officeFile.closeAsync();
                const blob = new Blob(chunks, { type: DOCX_MIME });
                const file = new File([blob], "template.docx", { type: DOCX_MIME });
                resolve(file);
              }
            });
          };
          getNextSlice();
        }
      );
    });
  }

  const uploadDocument = async (clickType) => {
    setApiLoadingStatus(true);
    setApiType(clickType);
    try {
      const { tenantId } = userInfoRef.current;
      if (!tenantId) {
        log(`Tenant ID not available yet. Please wait or re-open the add-in.`);
        return;
      }
      const docId = Office?.context?.document?.settings?.get("appDocId");
      if (!docId) {
        return;
      }
      const file = await getCurrentWordFile();
      const formData = new FormData();
      formData.append("file", file);
      const transformUrl = `${REACT_APP_BACKEND_BASE_URL}/extract/${tenantId}/${docId}`;
      log(`Uploading to: ${transformUrl}`);
      const response = await fetch(transformUrl, {
        method: "POST",
        // mode: "cors",
        body: formData,
        signal: AbortSignal.timeout(15000)
      }).catch((err) => {
        log(`Fetch error details: ${err.message}`);
        setApiLoadingStatus(false);
        setApiType(null);
        throw err;
      });
      if (!response.ok) {
        log(`Upload HTTP error: ${response.status} ${response.statusText}`);
        return;
      }
      const result = await response.json();
      log(`Received response: ${JSON.stringify(result)}`);
      if (result.status !== "ok") {
        log(`Upload failed: ${result.message || "Unknown error"}`);
        return;
      }
      const documentId = result.document_id || docId;
      const webHeaders = new Headers();
      webHeaders.append("Content-Type", "application/json");
      const webOutputUrl = `${REACT_APP_WEB_BASE_URL}/api/output/${clickType === "PDF" ? 'pdf' : 'web'}`;
      log(`Uploading to: ${webOutputUrl}`);
      const webResponse = await fetch(webOutputUrl, {
        method: "POST",
        mode: "cors",
        headers: webHeaders,
        body: JSON.stringify({ documentId: documentId, tenantId }),
        signal: AbortSignal.timeout(15000)
      }).catch((err) => {
        setApiLoadingStatus(false);
        setApiType(null);
        log(`Web fetch error: ${err.message}`);
        throw err;
      });
      if (!webResponse.ok) {
        log(`Web upload HTTP error: ${webResponse.status} ${webResponse.statusText}`);
        return;
      }
      const webResults = await webResponse.json();
      log(`Received web response: ${JSON.stringify(webResults)}`);
      // window.open(webResults.url, "_blank");
      // Office.context.ui.openBrowserWindow(webResults.url);
      // Office.context.ui.openBrowserWindow(`${webResults.url}`);
      const a = document.createElement("a");
      a.href = webResults.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      log(`Error: ${err.message || err}`);
      log(`Stack: ${err.stack}`);
      console.error(err);
      setApiLoadingStatus(false);
      setApiType(null);
    } finally {
      setApiLoadingStatus(false);
      setApiType(null);
    }
  };

  const headerComponents = COMPONENTS.filter((c) => c.category === "header");
  const textMediaComponents = COMPONENTS.filter((c) => c.category === "text-media");

  return (
    <div className="addin-root">
      {/* ── Header ── */}
      <header className="addin-header">
        <div className="brand">
          <PenIcon />
          <div className="brand-text">
            <span className="brand-title">Authoring</span>
            <span className="brand-subtitle">Toolbar</span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="tab-bar">
          <button
            className={`tab-btn${activeTab === "content" ? " tab-btn--active" : ""}`}
            onClick={() => setActiveTab("content")}
          >
            Content
          </button>
          <button
            className={`tab-btn${activeTab === "image" ? " tab-btn--active" : ""}`}
            onClick={() => setActiveTab("image")}
          >
            Image
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="addin-main">
        {activeTab === "content" ? (
          <>
            {/* Header section */}
            <section className="component-section">
              <h2 className="section-heading">Header</h2>
              <div className="card-grid">
                {headerComponents.map((comp) =>
                  renderComponentCard({ comp, loading, handleCardClick })
                )}
              </div>
              <div className="link-learning-panel">
                <div className="link-learning-top">
                  <div>
                    <div className="link-learning-title">Logo with Title</div>
                    <div className="link-learning-subtitle">Small logo with editable text</div>
                  </div>
                  <button
                    className="link-learning-upload"
                    onClick={() => linkFileInputRef.current?.click()}
                    disabled={loading === "logo-with-text"}
                  >
                    {linkImagePreview ? "Change" : "Upload"}
                  </button>
                </div>
                <div className="link-learning-preview-row">
                  <div className="link-learning-logo-box">
                    {linkImagePreview ? (
                      <img src={linkImagePreview} alt="Logo with Text preview" />
                    ) : (
                      <span>Logo</span>
                    )}
                  </div>
                  <div className="link-learning-text-preview">START TYPING...</div>
                </div>
                <div className="link-learning-actions">
                  <button
                    className="insert-btn"
                    onClick={handleLinkToLearningInsert}
                    disabled={!linkImageFile || loading === "logo-with-text"}
                  >
                    {loading === "logo-with-text" ? "Insertingâ€¦" : "Insert"}
                  </button>
                  {linkImagePreview && (
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setLinkImageFile(null);
                        setLinkImagePreview(null);
                        if (linkFileInputRef.current) linkFileInputRef.current.value = "";
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  ref={linkFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  style={{ display: "none" }}
                  onChange={handleLinkImageChange}
                />
              </div>
            </section>
            <div className="section-divider" />
            {/* Text section */}
            <section className="component-section">
              <h2 className="section-heading">Text</h2>
              <div className="card-grid">
                {textMediaComponents.map((comp) =>
                  renderComponentCard({ comp, loading, handleCardClick })
                )}
              </div>
            </section>
            <div className="section-divider" />
          </>
        ) : (
          /* Image tab */
          <section className="image-section">
            <div
              className={`drop-zone${isDragging ? " drop-zone--dragging" : ""}${imagePreview ? " drop-zone--has-image" : ""}`}
              onClick={() => fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="drop-zone-preview" />
              ) : (
                <>
                  {/* Image icon */}
                  <div className="drop-zone-icon">
                    <svg width="56" height="52" viewBox="0 0 56 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="4" width="44" height="36" rx="4" fill="#E0E0E0" stroke="#BDBDBD" strokeWidth="2" />
                      <circle cx="16" cy="14" r="4" fill="#9E9E9E" />
                      <path d="M4 32L16 20L24 28L34 16L48 34" stroke="#BDBDBD" strokeWidth="2" strokeLinejoin="round" />
                      <circle cx="40" cy="38" r="10" fill="#555" stroke="white" strokeWidth="2" />
                      <path d="M40 33V43M35 38H45" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="drop-zone-title">Drag &amp; drop image here</p>
                  <p className="drop-zone-subtitle">or browse files</p>
                  <button
                    className="insert-btn"
                    onClick={(e) => { e.stopPropagation(); if (imageFile) handleImageInsert(); else fileInputRef.current.click(); }}
                    disabled={loading === "figure-image"}
                  >
                    {loading === "figure-image" ? "Inserting…" : "Insert into Word"}
                  </button>
                </>
              )}
            </div>
            {imagePreview && (
              <div className="image-actions">
                <button
                  className="insert-btn"
                  onClick={handleImageInsert}
                  disabled={!imageFile || loading === "figure-image"}
                >
                  {loading === "figure-image" ? "Inserting…" : "Insert into Word"}
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                >
                  Remove
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </section>
        )}
      </main>

      {/* ── Footer actions ── */}
      <footer className="addin-footer">
        <button className="footer-btn footer-btn--pdf" onClick={() => uploadDocument("PDF")} disabled={(apiType === "WEB" || apiLoadingStatus)}>
          {apiLoadingStatus && apiType == "PDF" ? "Generating…" : "Preview Lesson PDF"}
        </button>
        <button
          className="footer-btn footer-btn--web"
          onClick={() => uploadDocument("WEB")}
          disabled={apiLoadingStatus}
        >
          {apiLoadingStatus && apiType == "WEB" ? "Generating…" : "Preview Lesson"}
        </button>
      </footer>

      {/* ── Status bar ── */}
      {status && (
        <div className={`status-bar${status.startsWith("✓") ? " status-bar--success" : " status-bar--error"}`}>
          {status}
        </div>
      )}

      {/* ── Debug ── */}
      {debugInfo && (
        <details className="debug-panel">
          <summary>Debug Log</summary>
          <pre>{debugInfo}</pre>
        </details>
      )}
    </div>
  );
}

/* ─── Helper functions (unchanged) ───────────────────────────────────────── */

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

async function getCursorRange(context) {
  const selection = context.document.getSelection();
  selection.load("isEmpty");
  await context.sync();
  return selection;
}

function wrapInContentControl(paragraph, meta) {
  const cc = paragraph.insertContentControl();
  cc.title = meta.label;
  cc.tag = JSON.stringify(meta);
  cc.appearance = Word.ContentControlAppearance.boundingBox;
  cc.cannotDelete = false;
  cc.cannotEdit = false;
  return cc;
}

function buildMeta(id) {
  const comp = COMPONENTS.find((c) => c.id === id);
  return {
    type: id,
    label: comp?.label ?? id,
    version: "1.0",
    insertedAt: new Date().toISOString(),
    schema: "openstax-biology-chapter-formatter",
  };
}

async function insertComponent(id) {
  return Word.run(async (context) => {
    const range = context.document.body.getRange("End");
    const meta = buildMeta(id);
    switch (id) {
      case "lesson-number": await insertLessonHeader(range, context, meta); break;
      case "lesson-title": await insertLessonTitle(range, context, meta); break;
      case "chapter-overview": await insertSectionSubHeader(range, context, meta); break;
      case "topic": await insertTopic(range, context, meta); break;
      case "section-title": await insertSectionTitle(range, context, meta); break;
      case "text": await insertBodyParagraph(range, context, meta); break;
      case "figure-caption": await insertFigureCaption(range, context, meta); break;
    }
    await context.sync();
  });
}

async function insertLessonHeader(range, context, meta) {
  const p = range.insertParagraph("LESSON", Word.InsertLocation.after);
  p.spaceBefore = 20; p.spaceAfter = 0;
  const r = p.getRange();
  r.font.name = "Arial"; r.font.size = 14; r.font.bold = false;
  r.font.color = "#2E74B5";
  await context.sync();
  wrapInContentControl(p, meta);
  await context.sync();
}

async function insertLessonTitle(range, context, meta) {
  const p = range.insertParagraph("", Word.InsertLocation.after);
  p.spaceBefore = 2; p.spaceAfter = 14;
  const r = p.getRange();
  r.font.name = "Arial"; r.font.size = 28; r.font.bold = false;
  r.font.color = "#1F1F1F";
  await context.sync();
  wrapInContentControl(p, meta);
  await context.sync();
}

async function insertSectionSubHeader(range, context, meta) {
  const p = range.insertParagraph("CHAPTER OUTLINE", Word.InsertLocation.after);
  p.spaceBefore = 8; p.spaceAfter = 4;
  const r = p.getRange();
  r.font.name = "Arial"; r.font.size = 11; r.font.bold = false;
  r.font.color = "#2E74B5";
  await context.sync();
  wrapInContentControl(p, meta);
  await context.sync();
}

async function insertTopic(range, context, meta) {
  const p = range.insertParagraph("", Word.InsertLocation.after);
  p.spaceAfter = 2;
  const r = p.getRange();
  r.font.name = "Arial"; r.font.size = 11; r.font.bold = true;
  r.font.color = "#1F1F1F";
  await context.sync();
  wrapInContentControl(p, meta);
  await context.sync();
}

async function insertSectionTitle(range, context, meta) {
  const p = range.insertParagraph("Section", Word.InsertLocation.after);
  p.spaceBefore = 16; p.spaceAfter = 8;
  const r = p.getRange();
  r.font.name = "Arial"; r.font.size = 18; r.font.bold = false;
  r.font.color = "#2E74B5";
  await context.sync();
  wrapInContentControl(p, meta);
  await context.sync();
}

async function insertBodyParagraph(range, context, meta) {
  const p = range.insertParagraph("Start typing your text here...", Word.InsertLocation.after);
  p.spaceBefore = 0; p.spaceAfter = 12;
  const r = p.getRange();
  r.font.name = "Arial"; r.font.size = 10; r.font.bold = false;
  r.font.color = "#1F1F1F";
  await context.sync();
  wrapInContentControl(p, meta);
  await context.sync();
}

async function insertFigureCaption(range, context, meta) {
  const label = range.insertParagraph(" Caption text here.", Word.InsertLocation.after);
  const caption = label.insertText("FIGURE 1.1", Word.InsertLocation.start);
  caption.font.name = "Arial"; caption.font.size = 9;
  caption.font.bold = true; caption.font.color = "#C00000";
  const labelRange = label.getRange();
  labelRange.font.name = "Arial"; labelRange.font.size = 9; labelRange.font.bold = false;
  labelRange.font.color = "#404040";
  labelRange.spaceBefore = 10;
  await context.sync();
  wrapInContentControl(label, meta);
  await context.sync();
}

async function insertLinkToLearning(base64) {
  return Word.run(async (context) => {
    const meta = buildMeta("logo-with-text");

    const range = context.document.body.getRange("End");

    const table = range.insertTable(
      1,
      2,
      Word.InsertLocation.after,
      [["", " START TYPING..."]]
    );

    // Remove visible borders.
    [
      Word.BorderLocation.top,
      Word.BorderLocation.bottom,
      Word.BorderLocation.left,
      Word.BorderLocation.right,
      Word.BorderLocation.insideHorizontal,
      Word.BorderLocation.insideVertical,
    ].forEach((borderLocation) => {
      const border = table.getBorder(borderLocation);
      border.type = Word.BorderType.none;
    });

    table.setCellPadding(Word.CellPaddingLocation.top, 0);
    table.setCellPadding(Word.CellPaddingLocation.bottom, 0);
    table.setCellPadding(Word.CellPaddingLocation.left, 0);
    table.setCellPadding(Word.CellPaddingLocation.right, 0);

    const imageCell = table.getCell(0, 0);
    const textCell = table.getCell(0, 1);

    imageCell.columnWidth = 28;

    imageCell.verticalAlignment = Word.VerticalAlignment.center;
    textCell.verticalAlignment = Word.VerticalAlignment.center;

    const imageParagraph = imageCell.body.paragraphs.getFirst();
    imageParagraph.spaceBefore = 0;
    imageParagraph.spaceAfter = 0;
    imageParagraph.lineSpacing = 12;
    imageParagraph.alignment = Word.Alignment.centered;

    const textParagraph = textCell.body.paragraphs.getFirst();
    textParagraph.spaceBefore = 0;
    textParagraph.spaceAfter = 0;
    textParagraph.lineSpacing = 12;
    textParagraph.alignment = Word.Alignment.left;

    const textRange = textParagraph.getRange();
    textRange.font.name = "Arial";
    textRange.font.size = 12;
    textRange.font.bold = true;
    textRange.font.color = "#1F1F1F";

    const img = imageParagraph.insertInlinePictureFromBase64(
      base64,
      Word.InsertLocation.start
    );

    img.width = 24;
    img.height = 24;

    await context.sync();

    wrapInContentControl(table, meta);

    await context.sync();
  });
}

async function insertFigureImage(base64) {
  return Word.run(async (context) => {
    const meta = buildMeta("figure-image");
    const range = await getCursorRange(context);
    const imagePara = range.insertParagraph("", Word.InsertLocation.after);
    const img = imagePara.insertInlinePictureFromBase64(base64, Word.InsertLocation.start);
    img.width = 414;
    img.alignment = Word.Alignment.centered;
    const captionPara = imagePara.insertParagraph(" Caption text here.", Word.InsertLocation.after);
    const caption = captionPara.insertText("FIGURE 1.1", Word.InsertLocation.start);
    caption.font.bold = true;
    caption.font.color = "#C00000";
    await context.sync();
    const startRange = imagePara.getRange();
    const endRange = captionPara.getRange();
    await context.sync();
    const figureRange = startRange.expandTo(endRange);
    const cc = figureRange.insertContentControl();
    cc.title = meta.label;
    cc.tag = JSON.stringify(meta);
    cc.appearance = Word.ContentControlAppearance.boundingBox;
    await context.sync();
  });
}
