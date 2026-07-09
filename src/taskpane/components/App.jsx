import React, { useState, useRef } from "react";
import "./App.css";
import { PAGE_TYPE, DEFAULT_PAGE, LAYOUT_COMPONENTS } from "./constants";

const REACT_APP_TENANT_ID = "4379b1c922fe47a3bb96e7786b412bb4";
const REACT_APP_BACKEND_BASE_URL = "https://api-prjx.academian.com/qa";
const REACT_APP_WEB_BASE_URL = "https://prjx.academian.com";

const InstrcutionIcon = () => (
  <svg className="instruction-icon" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.71543 0 0 6.71602 0 15C0 23.284 6.71543 30 15 30C23.2846 30 30 23.2846 30 15C30 6.71543 23.2846 0 15 0ZM15 7.5C16.0354 7.5 16.875 8.33965 16.875 9.375C16.875 10.4104 16.0354 11.25 15 11.25C13.9646 11.25 13.125 10.4109 13.125 9.375C13.125 8.33906 13.9646 7.5 15 7.5ZM17.8125 22.5H12.1875C11.6695 22.5 11.25 22.0805 11.25 21.5625C11.25 21.0445 11.6695 20.625 12.1875 20.625H13.125V15H12.1875C11.6695 15 11.25 14.5805 11.25 14.0625C11.25 13.5445 11.6695 13.125 12.1875 13.125H15.9375C16.4555 13.125 16.875 13.5445 16.875 14.0625V20.625H17.8125C18.3305 20.625 18.75 21.0445 18.75 21.5625C18.75 22.0805 18.3305 22.5 17.8125 22.5Z" fill="#0E236C" />
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
      </div>
      <div className="component-card-divider"></div>
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
  const [activeTab, setActiveTab] = useState("content");
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
  const [currentPage, setcurrentPage] = useState(DEFAULT_PAGE);
  const [showContainerModal, setShowContainerModal] = useState(false);
  const [pendingComponent, setPendingComponent] = useState(null);
  const {
    COMPONENTS,
    STYLES,
    COMPONENT_CONFIG,
  } = PAGE_TYPE[currentPage ?? DEFAULT_PAGE];

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

  // Build the layout object that will be embedded into every content-control tag
  const buildLayoutContext = () => {
    return currentPage;
  };

  const handleCardClick = async (id,
    components = COMPONENTS,
    componentConfig = COMPONENT_CONFIG,
    styles = STYLES
  ) => {
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
      // Pass the current layout context so it gets embedded in the tag
      await insertComponent(id, components, componentConfig, styles, buildLayoutContext());
      setStatus(`✓ "${components.find((c) => c.id === id)?.label}" inserted.`);
    } catch (err) {
      if (err.code === "OUTSIDE_CONTAINER") {
        setPendingComponent(id);
        setShowContainerModal(true);
        return;
      }
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
      setStatus("✗ Please select an image file.");
      return;
    }
    setLinkImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLinkImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleLinkToLearningInsert = async () => {
    if (!linkImageFile) {
      setStatus("✗ Please upload a Logo with Text image first.");
      return;
    }
    setLoading("logo-with-text");
    setStatus("");
    try {
      const base64 = await fileToBase64(linkImageFile);
      await insertLinkToLearning(base64, linkImageFile.type, COMPONENTS, buildLayoutContext());
      setStatus("✓ Logo with Text inserted.");
      setLinkImageFile(null);
      setLinkImagePreview(null);
      if (linkFileInputRef.current) linkFileInputRef.current.value = "";
    } catch (err) {
      setStatus(`✗ Error: ${err.message || "Logo with Text insert failed."}`);
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
      await insertFigureImage(base64, COMPONENTS, buildLayoutContext());
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
      if (!docId) return;

      const file = await getCurrentWordFile();
      const formData = new FormData();
      formData.append("file", file);
      const transformUrl = `${REACT_APP_BACKEND_BASE_URL}/extract/${tenantId}/${docId}`;
      log(`Uploading to: ${transformUrl}`);
      const response = await fetch(transformUrl, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(30000)
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
      const webOutputUrl = `${REACT_APP_WEB_BASE_URL}/api/output/${clickType === "PDF" ? "pdf" : "web"}`;
      log(`Uploading to: ${webOutputUrl}`);
      const webResponse = await fetch(webOutputUrl, {
        method: "POST",
        mode: "cors",
        headers: webHeaders,
        body: JSON.stringify({ documentId: documentId, tenantId }),
        signal: AbortSignal.timeout(30000)
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

  const insertInsideNewContainer = async (containerType) => {
    try {
      setShowContainerModal(false);

      // Insert container directly
      await insertComponent(
        containerType,
        LAYOUT_COMPONENTS,
        {
          [containerType]: {
            style: {}
          }
        },
        {},
        buildLayoutContext()
      );

      // Wait for Word to update the selection
      await new Promise(resolve => setTimeout(resolve, 300));

      // Insert the original component
      if (pendingComponent) {
        await insertComponent(
          pendingComponent,
          COMPONENTS,
          COMPONENT_CONFIG,
          STYLES,
          buildLayoutContext()
        );
      }

      setPendingComponent(null);

    } catch (err) {
      console.error(err);
      setStatus(err.message);
    }
  };

  const headerComponents = COMPONENTS.filter((c) => c.category === "header");
  const textMediaComponents = COMPONENTS.filter((c) => c.category === "text-media");

  return (
    <div className="addin-root">
      {/* ── Header ── */}
      <header className="addin-header">
        <div className="brand-logo">
          <img src="../assets/Author_Logo.png" alt="Brand Logo" className="brand-logo-img" />
        </div>
        <div className="tab-bar">
          <button
            className={`tab-btn${activeTab === "content" ? " tab-btn--active" : ""}`}
            onClick={() => setActiveTab("content")}
          >
            Content
          </button>
          <button
            className={`tab-btn${activeTab === "ai" ? " tab-btn--active" : ""}`}
            onClick={() => setActiveTab("ai")}
          >
            AI Assistant
          </button>
          <button
            className={`tab-btn${activeTab === "media" ? " tab-btn--active" : ""}`}
            onClick={() => setActiveTab("media")}
          >
            Media
          </button>
        </div>
      </header>

      {(activeTab === "content" || activeTab === "media") && (<>
        {/* Book selector — now lives inside the layout context panel */}
        <div className="page-layout-panel">
          <div className="page-layout-row">
            <span className="page-layout-title">
              Page Type Layout:
            </span>
            <div className="page-layout-buttons">
              <button
                className="page-layout-btn"
                onClick={() => handleCardClick(
                  "opener",
                  LAYOUT_COMPONENTS,
                  {
                    opener: {
                      style: {}
                    }
                  },
                  {}
                )}
              >
                Opener
              </button>
              <button
                className="page-layout-btn"
                onClick={() => handleCardClick(
                  "non-opener",
                  LAYOUT_COMPONENTS,
                  {
                    "non-opener": {
                      style: {}
                    }
                  },
                  {}
                )}
              >
                Non Opener
              </button>
            </div>
          </div>
          <div className="page-layout-filter">
            <label className="page-layout-filter-label">
              Page Type Filter:
            </label>
            <select
              className="page-layout-select"
              value={currentPage}
              onChange={(e) => setcurrentPage(e.target.value)}
            >
              {Object.values(PAGE_TYPE).map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </>
      )}
      {/* ─────────────────────────────────────────────────────────────────────── */}

      {/* ── Main ── */}
      <main className="addin-main">
        {status && (
          <p className={`intruction-text${status.startsWith("✓") ? " instruction-text--success" : " instruction-text--error"}`}>
            <InstrcutionIcon />
            {status}
          </p>
        )}

        {activeTab === "content" ? (
          <>
            <section className="component-section">
              <h2 className="section-heading">Header</h2>
              <div className="card-grid">
                {headerComponents.map((comp) =>
                  renderComponentCard({ comp, loading, handleCardClick })
                )}
              </div>
            </section>
            <div className="section-divider" />
            <section className="component-section">
              <h2 className="section-heading">Text</h2>
              <div className="card-grid">
                {textMediaComponents.map((comp) =>
                  renderComponentCard({ comp, loading, handleCardClick })
                )}
              </div>
            </section>
          </>
        ) : activeTab === "ai" ? (
          <section className="component-section">
            AI Assistant
          </section>
        ) : (
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

            <div className="link-learning-panel">
              <div className="link-learning-top">
                <div>
                  <div className="link-learning-title">Icon with Title</div>
                </div>
                <button
                  className="link-learning-upload"
                  onClick={() => linkFileInputRef.current?.click()}
                  disabled={loading === "logo-with-text"}
                >
                  {linkImagePreview ? "Change" : "Upload Icon"}
                </button>
              </div>
              <div className="link-learning-preview-row">
                <div className="link-learning-logo-box">
                  {linkImagePreview
                    ? <img src={linkImagePreview} alt="Logo with Text preview" />
                    : <span>Logo</span>
                  }
                </div>
                <div className="link-learning-text-preview">Text with Icon</div>
              </div>
              <div className="link-learning-actions">
                <button
                  className="insert-btn"
                  onClick={handleLinkToLearningInsert}
                  disabled={!linkImageFile || loading === "logo-with-text"}
                >
                  {loading === "logo-with-text" ? "Inserting…" : "Insert"}
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
        )}

        {debugInfo && (
          <details className="debug-panel" open>
            <summary>Debug Log</summary>
            <pre>{debugInfo}</pre>
            <button className="clear-log" onClick={() => setDebugInfo(" ")}>
              Clear Log
            </button>
          </details>
        )}
      </main>
      {
        showContainerModal && (
          <div className="container-modal-overlay">
            <div className="container-modal">
              <h3>Select Container</h3>
              <p>
                This component must be placed inside an Opener or Non Opener.
              </p>
              <button
                onClick={() => insertInsideNewContainer("opener")}
              >
                Opener
              </button>
              <button
                onClick={() => insertInsideNewContainer("non-opener")}
              >
                Non Opener
              </button>
              <button
                onClick={() => setShowContainerModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )
      }

      {/* ── Footer ── */}
      <footer className="addin-footer">
        <button
          className="footer-btn footer-btn--pdf"
          onClick={() => uploadDocument("PDF")}
          disabled={apiType === "WEB" || apiLoadingStatus}
        >
          {apiLoadingStatus && apiType === "PDF" ? "Generating…" : "Preview Lesson PDF"}
        </button>
        <button
          className="footer-btn footer-btn--web"
          onClick={() => uploadDocument("WEB")}
          disabled={apiLoadingStatus}
        >
          {apiLoadingStatus && apiType === "WEB" ? "Generating…" : "Preview Lesson"}
        </button>
        <button className="footer-btn footer-btn--pdf" onClick={() => { }}>
          Export EPUB
        </button>
        <button className="footer-btn footer-btn--pdf" onClick={() => { }}>
          Content Differences
        </button>
      </footer>

    </div>
  );
}

/* ─── Helper functions ────────────────────────────────────────────────────── */

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}
async function getInsertionRange(context, componentId) {
  const selection = context.document.getSelection();

  if (componentId === "opener" || componentId === "non-opener") {
    return selection;
  }

  const parentCC = selection.parentContentControlOrNullObject;

  parentCC.load("isNullObject,tag");

  await context.sync();

  if (parentCC.isNullObject) {
    const err = new Error("OUTSIDE_CONTAINER");
    err.code = "OUTSIDE_CONTAINER";
    throw err;
  }

  let meta;

  try {
    meta = JSON.parse(parentCC.tag);
  } catch {
    throw new Error("Invalid parent content control.");
  }

  if (!meta.container) {
    const err = new Error("OUTSIDE_CONTAINER");
    err.code = "OUTSIDE_CONTAINER";
    throw err;
  }

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

/**
 * Builds the metadata object embedded in every content-control tag.*/
function buildMeta(id, COMPONENTS, layoutContext) {
  const comp = COMPONENTS.find((c) => c.id === id);

  return {
    type: id,
    label: comp?.label ?? id,
    preview: comp?.preview ?? "",
    version: "1.0",
    insertedAt: new Date().toISOString(),
    schema: "openstax-biology-chapter-formatter",
    placeholder: comp?.placeholder ?? "",
    pageTypeFilter: layoutContext,
    container: id === "opener" ||
      id === "non-opener" ||
      comp?.container === true
  };
}

async function insertComponent(id, COMPONENTS, COMPONENT_CONFIG, STYLES, layoutContext) {
  return Word.run(async (context) => {
    const range = await getInsertionRange(context, id);
    const meta = buildMeta(id, COMPONENTS, layoutContext);

    if (id === "bullet-list") {
      return insertBulletItem(range, context, meta, STYLES);
    }

    const config = COMPONENT_CONFIG[id] || { style: {} };

    if (config.dual) {
      await insertDualTextComponent(
        range,
        context,
        meta,
        config.dual
      );
      return;
    }

    await insertStyledComponent(
      range,
      context,
      meta,
      config
    );

    await context.sync();
  });
}

async function insertStyledComponent(
  range,
  context,
  meta,
  config
) {

  // Create paragraph first
  const paragraph = range.insertParagraph(
    meta.placeholder,
    Word.InsertLocation.before
  );
  const cc = paragraph.insertContentControl();
  cc.title = meta.label;
  cc.tag = JSON.stringify(meta);
  cc.appearance = Word.ContentControlAppearance.boundingBox;
  cc.cannotDelete = false;
  cc.cannotEdit = false;
  await context.sync();
  if (meta.container) {
    const containerRange = cc.getRange();
    containerRange.insertParagraph(
      "",
      Word.InsertLocation.end
    );
    await context.sync();
    const contentRange = cc.getRange("End");
    contentRange.select();
    await context.sync();
    return;
  }
  const body = cc.getRange();
  body.insertText(
    "",
    Word.InsertLocation.end
  );
  if (config.style) {
    applyStyle(body, config.style);
  }
  await context.sync();
  body.select();
}
function applyStyle(range, style) {
  range.font.name = style.font;
  range.font.size = style.size;
  range.font.color = style.color;
  range.font.bold = style.bold || false;
  if (style.backgroundColor) {
    range.font.highlightColor = style.backgroundColor;
  } else {
    range.font.highlightColor = "#FFFFFF";
  }
}

async function insertDualTextComponent(range, context, meta, config) {
  const paragraph = range.insertParagraph(config.text, Word.InsertLocation.before);
  const prefixRange = paragraph.insertText(config.prefix, Word.InsertLocation.start);
  const fullRange = paragraph.getRange();
  applyStyle(fullRange, config.textStyle);
  applyStyle(prefixRange, config.prefixStyle);
  await context.sync();
  wrapInContentControl(paragraph, meta);
  await context.sync();
}

async function insertFigureImage(base64, COMPONENTS, layoutContext) {
  return Word.run(async (context) => {
    const meta = buildMeta("figure-image", COMPONENTS, layoutContext);
    const range = await getInsertionRange(context);
    const imagePara = range.insertParagraph("", Word.InsertLocation.before);
    const img = imagePara.insertInlinePictureFromBase64(base64, Word.InsertLocation.start);
    img.width = 414;
    img.alignment = Word.Alignment.centered;
    const captionPara = imagePara.insertParagraph(" Caption text here.", Word.InsertLocation.after);
    const caption = captionPara.insertText("FIGURE 1.1", Word.InsertLocation.start);
    caption.font.bold = true;
    caption.font.color = "#C00000";
    captionPara.font.size = 10;
    caption.font.size = 10;
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

async function insertBulletItem(range, context, meta, STYLES) {
  const p = range.insertParagraph("", Word.InsertLocation.before);
  const r = p.getRange();
  applyStyle(r, STYLES.bullestList);
  p.startNewList();
  p.listItem.level = 0;
  await context.sync();
  wrapInContentControl(p, meta);
  await context.sync();
}

async function insertLinkToLearning(base64, mimeType = "image/png", COMPONENTS, layoutContext) {
  return Word.run(async (context) => {
    const meta = buildMeta("logo-with-text", COMPONENTS, layoutContext);
    const platform = String(
      Office?.context?.platform || Office?.context?.diagnostics?.platform || ""
    ).toLowerCase();
    const isWordWeb = platform.includes("online") || platform.includes("web");

    const range = await getInsertionRange(context);

    if (isWordWeb) {
      const html = `
        <table style="border-collapse:collapse;border:none;width:auto;">
          <colgroup>
            <col width="28" style="width:28pt;max-width:28pt;" />
            <col style="width:auto;" />
          </colgroup>
          <tr>
            <td width="28" style="border:none;width:28pt;max-width:28pt;padding:0;vertical-align:middle;text-align:center;white-space:nowrap;">
              <img src="data:${mimeType};base64,${base64}" width="24" height="24" style="width:24pt;height:24pt;vertical-align:middle;" />
            </td>
            <td style="border:none;padding:0;vertical-align:middle;">
              <span style="font-family:Arial;font-size:12pt;font-weight:bold;color:#1F1F1F;"> START TYPING...</span>
            </td>
          </tr>
        </table>
      `;
      const insertedRange = range.insertHtml(html, Word.InsertLocation.after);
      await context.sync();
      wrapInContentControl(insertedRange, meta);
      await context.sync();
      return;
    }

    const table = range.insertTable(1, 2, Word.InsertLocation.after, [["", " START TYPING..."]]);

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

    const img = imageParagraph.insertInlinePictureFromBase64(base64, Word.InsertLocation.start);
    img.width = 24;
    img.height = 24;

    await context.sync();
    wrapInContentControl(table, meta);
    await context.sync();
  });
}

async function getCursorRange(context) {
  const selection = context.document.getSelection();
  selection.load("isEmpty");
  await context.sync();
  return selection;
}