import React, { useState, useRef } from "react";
import "./App.css";
import { PAGE_TYPE, DEFAULT_PAGE, LAYOUT_COMPONENTS } from "./constants";

const REACT_APP_TENANT_ID = process.env.REACT_APP_TENANT_ID;
const REACT_APP_BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
const REACT_APP_WEB_BASE_URL = process.env.REACT_APP_WEB_BASE_URL;
const CONTAINER_COMPONENT_IDS = ["opener", "non-opener"];

const isContainerComponent = (id) => CONTAINER_COMPONENT_IDS.includes(id);

const InstrcutionIcon = () => (
  <svg className="instruction-icon" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.71543 0 0 6.71602 0 15C0 23.284 6.71543 30 15 30C23.2846 30 30 23.2846 30 15C30 6.71543 23.2846 0 15 0ZM15 7.5C16.0354 7.5 16.875 8.33965 16.875 9.375C16.875 10.4104 16.0354 11.25 15 11.25C13.9646 11.25 13.125 10.4109 13.125 9.375C13.125 8.33906 13.9646 7.5 15 7.5ZM17.8125 22.5H12.1875C11.6695 22.5 11.25 22.0805 11.25 21.5625C11.25 21.0445 11.6695 20.625 12.1875 20.625H13.125V15H12.1875C11.6695 15 11.25 14.5805 11.25 14.0625C11.25 13.5445 11.6695 13.125 12.1875 13.125H15.9375C16.4555 13.125 16.875 13.5445 16.875 14.0625V20.625H17.8125C18.3305 20.625 18.75 21.0445 18.75 21.5625C18.75 22.0805 18.3305 22.5 17.8125 22.5Z" fill="#0E236C" />
  </svg>
);

const renderComponentCard = ({ comp, loading, handleCardClick }) => {
  if (!comp || comp.id === "image" || comp.id === "logo-with-text") return null;
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
  const [showImageModal, setShowImageModal] = useState(false);

  // ── Reliable "which container am I inserting into" tracking ──────────────
  // Word Online does not reliably preserve/restore the document selection
  // across a click into the taskpane the way Word Desktop does, so we can't
  // depend on `context.document.getSelection()` still pointing at the right
  // place on the *next* insert. Instead we track the active container's
  // content-control id explicitly in a ref, and update it in two ways:
  //   1. Programmatically, right after we create/enter a container.
  //   2. From a DocumentSelectionChanged handler, when the user manually
  //      clicks somewhere else in the document.
  const activeContainerIdRef = useRef(null);

  // ── Reliable "which component inside the container is the cursor on"
  // tracking ─────────────────────────────────────────────────────────────
  // In addition to knowing which container is active, we need to know
  // *which child component inside that container* the cursor is currently
  // on, so a new insert lands immediately after that specific component
  // (as a sibling) rather than always being appended to the end of the
  // container. This is kept in sync the same two ways as
  // activeContainerIdRef above: right after we insert a new component, and
  // from the DocumentSelectionChanged handler when the user clicks
  // somewhere else by hand.
  const activeComponentIdRef = useRef(null);

  const pageConfig =
    PAGE_TYPE[currentPage ?? DEFAULT_PAGE] ||
    Object.values(PAGE_TYPE).find((page) => page.id === currentPage) ||
    PAGE_TYPE[DEFAULT_PAGE];
  const {
    COMPONENTS,
    STYLES,
    COMPONENT_CONFIG,
  } = pageConfig;

  React.useEffect(() => {
    let docId = Office?.context?.document?.settings.get("appDocId");
    if (!docId) {
      docId = crypto.randomUUID();
      Office?.context?.document?.settings.set("appDocId", docId);
      Office?.context?.document?.settings.saveAsync();
    }
  }, []);

  // Keep activeContainerIdRef / activeComponentIdRef in sync whenever the
  // user clicks around the document by hand (not just when our own code
  // inserts something).
  React.useEffect(() => {
    let registered = false;

    const onSelectionChanged = async () => {
      try {
        await Word.run(async (context) => {
          const selection = context.document.getSelection();
          const { container, selectedComponent } = await getContentControlContext(context, selection);
          if (container) {
            container.load("id");
            if (selectedComponent) {
              selectedComponent.load("id");
            }
            await context.sync();
            activeContainerIdRef.current = container.id;
            // selectedComponent is the specific child component the cursor
            // is currently inside (or null if the cursor is on the
            // container itself, not on any particular child) — either way
            // this reflects the true current state, so we always update it.
            activeComponentIdRef.current = selectedComponent ? selectedComponent.id : null;
          }
          // If the click landed outside any container, we deliberately do
          // NOT clear activeContainerIdRef/activeComponentIdRef here — an
          // accidental click just outside a container (e.g. on whitespace)
          // shouldn't forget the container/component the user was just
          // working in. They only change when we can positively resolve a
          // new container.
        });
      } catch (err) {
        // Non-fatal — selection tracking is best-effort.
      }
    };

    if (Office?.context?.document?.addHandlerAsync) {
      Office.context.document.addHandlerAsync(
        Office.EventType.DocumentSelectionChanged,
        onSelectionChanged
      );
      registered = true;
    }

    return () => {
      if (registered && Office?.context?.document?.removeHandlerAsync) {
        Office.context.document.removeHandlerAsync(
          Office.EventType.DocumentSelectionChanged,
          { handler: onSelectionChanged }
        );
      }
    };
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
    if (id === "image") {
      setShowImageModal(true);
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
      await insertComponent(
        id,
        components,
        componentConfig,
        styles,
        buildLayoutContext(),
        activeContainerIdRef,
        activeComponentIdRef
      );
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
      await insertLinkToLearning(
        base64,
        linkImageFile.type,
        COMPONENTS,
        buildLayoutContext(),
        activeContainerIdRef,
        activeComponentIdRef
      );
      setStatus("✓ Logo with Text inserted.");
      setLinkImageFile(null);
      setLinkImagePreview(null);
      if (linkFileInputRef.current) linkFileInputRef.current.value = "";
    } catch (err) {
      if (err.code === "OUTSIDE_CONTAINER") {
        setPendingComponent("logo-with-text");
        setShowContainerModal(true);
        return;
      }
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
    setLoading("image");
    setStatus("");
    try {
      const base64 = await fileToBase64(imageFile);
      await insertFigureImage(base64, COMPONENTS, buildLayoutContext(), activeContainerIdRef, activeComponentIdRef);
      setStatus("✓ Figure image inserted.");
      setImageFile(null);
      setImagePreview(null);
      setShowImageModal(false);
    } catch (err) {
      if (err.code === "OUTSIDE_CONTAINER") {
        setShowImageModal(false);
        setPendingComponent("image");
        setShowContainerModal(true);
        return;
      }
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
      if (result.status === "failed" || result.status === "error") {
        log(`Upload failed: ${result.message || "Unknown error"}`);
        return;
      }
      const documentId = result.document_id || docId;

      /* Status checking */
      const statusUrl = `${REACT_APP_BACKEND_BASE_URL}/extract/${tenantId}/${documentId}/status`;

      const pollStatus = async () => {
        while (true) {
          const statusResponse = await fetch(statusUrl, {
            method: "GET",
            signal: AbortSignal.timeout(30000)
          });

          if (!statusResponse.ok) {
            log(`Status API failed: ${statusResponse.status} ${statusResponse.statusText}`);
            return false;
          }

          const statusResult = await statusResponse.json();
          log(`Status response: ${JSON.stringify(statusResult)}`);

          if (statusResult.status === "succeeded") {
            log(`Document extraction succeeded. job_id: ${statusResult.job_id}`);
            return true;
          }

          if (statusResult.status === "failed") {
            log(`Document extraction failed for document_id: ${statusResult.document_id}`);
            return false;
          }

          // Still pending/processing — wait 5 seconds before checking again
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      };

      const isSucceeded = await pollStatus();
      if (!isSucceeded) {
        log(`Stopping: extraction did not succeed.`);
        return;
      }
      /* Status checking end */

      const webHeaders = new Headers();
      webHeaders.append("Content-Type", "application/json");
      const webOutputUrl = `${REACT_APP_WEB_BASE_URL}/${clickType === "PDF" ? "pdf" : "web"}`;
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
      log(`[container-modal] click "${containerType}", pendingComponent="${pendingComponent}"`);

      if (pendingComponent === "image") {
        // Media (figure image) must go through the same "create a
        // container, then insert the child inside it" flow as every other
        // component — it just needs the image-specific insertion logic
        // (inline picture + caption) instead of the generic styled-text one.
        if (!imageFile) {
          setStatus("✗ Please select an image first.");
          setPendingComponent(null);
          return;
        }
        const base64 = await fileToBase64(imageFile);
        await insertContainerThenImage(
          containerType,
          base64,
          COMPONENTS,
          buildLayoutContext(),
          activeContainerIdRef,
          activeComponentIdRef,
          log
        );
        setImageFile(null);
        setImagePreview(null);
        setShowImageModal(false);
        setStatus("✓ Figure image inserted.");
      } else if (pendingComponent === "logo-with-text") {
        // Same as above, but for the Icon-with-Text (logo-with-text)
        // component, which needs its own HTML/table-based insertion logic.
        if (!linkImageFile) {
          setStatus("✗ Please upload a Logo with Text image first.");
          setPendingComponent(null);
          return;
        }
        const base64 = await fileToBase64(linkImageFile);
        await insertContainerThenLinkToLearning(
          containerType,
          base64,
          linkImageFile.type,
          COMPONENTS,
          buildLayoutContext(),
          activeContainerIdRef,
          activeComponentIdRef
        );
        setLinkImageFile(null);
        setLinkImagePreview(null);
        if (linkFileInputRef.current) linkFileInputRef.current.value = "";
        setStatus("✓ Logo with Text inserted.");
      } else if (pendingComponent) {
        // pendingComponent was chosen from the currently active page's
        // component set, so reuse that exact set for the nested insert.
        await insertComponentInsideNewContainer(
          containerType,
          pendingComponent,
          COMPONENTS,
          COMPONENT_CONFIG,
          STYLES,
          activeContainerIdRef,
          activeComponentIdRef,
          log
        );
      } else {
        await insertComponent(
          containerType,
          LAYOUT_COMPONENTS,
          {
            [containerType]: {
              style: {}
            }
          },
          {},
          containerType,
          activeContainerIdRef,
          activeComponentIdRef
        );
      }

      log(`[container-modal] done`);
      setPendingComponent(null);

    } catch (err) {
      console.error(err);
      log(`[container-modal] ERROR: ${err.message || err}`);
      if (err.debugInfo) {
        log(`[container-modal] debugInfo: ${JSON.stringify(err.debugInfo)}`);
      }
      if (err.stack) {
        log(`[container-modal] stack: ${err.stack}`);
      }
      setStatus(`✗ Error: ${err.message || "Something went wrong."}`);
    } finally {
      setTimeout(() => setStatus(""), 2000);
    }
  };

  const headerComponents = COMPONENTS.filter((c) => c.category === "header");
  const textMediaComponents = COMPONENTS.filter((c) => c.category === "text-media");
  const imageComponent = COMPONENTS.find((c) => c.id === "image");

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
            AI Assisted
          </button>
          <button
            className={`tab-btn${activeTab === "publish" ? " tab-btn--active" : ""}`}
            onClick={() => setActiveTab("publish")}
          >
            Publish
          </button>
        </div>
      </header>

      {activeTab === "content" && (<>
        {/* Book selector — now lives inside the layout context panel */}
        <div className="layoutctl-panel">
          <div className="layoutctl-row">
            <span className="layoutctl-label">Layout</span>
            <div className="layoutctl-segmented" role="group" aria-label="Insert page layout">
              <button
                type="button"
                className="layoutctl-segment"
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
                type="button"
                className="layoutctl-segment"
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

          <div className="layoutctl-row">
            <label className="layoutctl-label" htmlFor="layoutctl-filter-select">Filter</label>
            <div className="layoutctl-select-wrap">
              <select
                id="layoutctl-filter-select"
                className="layoutctl-select"
                value={currentPage}
                onChange={(e) => setcurrentPage(e.target.value)}
              >
                {Object.values(PAGE_TYPE).map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name}
                  </option>
                ))}
              </select>
              <svg className="layoutctl-select-chevron" width="9" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
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
            <div className="section-divider" />
            <section className="component-section">
              <h2 className="section-heading">Media</h2>
              <div className="card-grid">
                {imageComponent && (
                  <button
                    key={imageComponent.id}
                    className={`component-card${loading === "image" ? " component-card--loading" : ""}`}
                    onClick={() => handleCardClick("image")}
                    disabled={!!loading}
                    aria-label={`Insert ${imageComponent.label}`}
                  >
                    <div className="component-card-top">
                      <span className="component-card-label">
                        {loading === "image" ? "Inserting…" : imageComponent.label}
                      </span>
                    </div>
                  </button>
                )}
              </div>

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
          </>
        ) : activeTab === "ai" ? (
          <section className="component-section component-section--ai">
            <button className="ai-buttons">
              Create chapter summary
            </button>
            <button className="ai-buttons">
              Create Objectives
            </button>
            <button className="ai-buttons">
              Apply style guide
            </button>
            <button className="ai-buttons">
              Check accessibility
            </button>
          </section>
        ) : (
          <section className="component-section publish-panel">
            <div className="publish-actions">
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
        showImageModal && (
          <div className="container-modal-overlay" onClick={() => setShowImageModal(false)}>
            <div className="image-modal" onClick={(e) => e.stopPropagation()}>
              <div className="image-modal-header">
                <h3>Insert Image</h3>
                <button
                  type="button"
                  className="image-modal-close"
                  aria-label="Close"
                  onClick={() => setShowImageModal(false)}
                >
                  ×
                </button>
              </div>
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
                        disabled={loading === "image"}
                      >
                        {loading === "image" ? "Inserting…" : "Insert into Word"}
                      </button>
                    </>
                  )}
                </div>
                {imagePreview && (
                  <div className="image-actions">
                    <button
                      className="insert-btn"
                      onClick={handleImageInsert}
                      disabled={!imageFile || loading === "image"}
                    >
                      {loading === "image" ? "Inserting…" : "Insert into Word"}
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
            </div>
          </div>
        )
      }
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
function parseContentControlTag(tag) {
  if (!tag) return null;
  try {
    return JSON.parse(tag);
  } catch {
    return null;
  }
}

async function getContentControlContext(context, selection) {
  let current = selection.parentContentControlOrNullObject;
  let selectedComponent = null;

  for (let depth = 0; depth < 20; depth += 1) {
    current.load("isNullObject,tag");
    await context.sync();

    if (current.isNullObject) {
      return { container: null, selectedComponent: null };
    }

    const meta = parseContentControlTag(current.tag);

    if (meta?.container) {
      return { container: current, selectedComponent };
    }

    selectedComponent = selectedComponent || current;
    current = current.parentContentControlOrNullObject;
  }

  return { container: null, selectedComponent: null };
}

/**
 * Always resolves to the LAST opener/non-opener content control in
 * document order — regardless of where the cursor/selection currently is.
 * This is what makes clicking "Opener"/"Non Opener" deterministic: it
 * always appends after the most recently inserted container, never nests,
 * and never depends on the (sometimes unreliable) ambient selection.
 */
async function getLastContainerControl(context) {
  const contentControls = context.document.body.contentControls;
  contentControls.load("items/tag");
  await context.sync();

  let lastContainer = null;
  for (const cc of contentControls.items) {
    const meta = parseContentControlTag(cc.tag);
    if (meta?.container) {
      lastContainer = cc; // items are in document order, so the last match wins
    }
  }
  return lastContainer;
}

/**
 * Resolves the currently-active container by id (loaded from
 * activeContainerIdRef.current) rather than the live document selection.
 * This is the key fix for Word Online: taskpane clicks don't reliably
 * preserve/restore the document selection the way Word Desktop does, so
 * chaining inserts off `context.document.getSelection()` across separate
 * `Word.run()` calls is flaky there. Resolving by a stored content-control
 * id is reliable on both platforms.
 */
async function getContainerById(context, containerId) {
  if (!containerId) return null;
  const cc = context.document.contentControls.getByIdOrNullObject(containerId);
  cc.load("isNullObject");
  await context.sync();
  return cc.isNullObject ? null : cc;
}

/**
 * Same idea as getContainerById, but for the specific child component
 * (content control) inside the active container that the cursor was last
 * known to be on — loaded from activeComponentIdRef.current.
 */
async function getComponentById(context, componentId) {
  if (!componentId) return null;
  const cc = context.document.contentControls.getByIdOrNullObject(componentId);
  cc.load("isNullObject");
  await context.sync();
  return cc.isNullObject ? null : cc;
}

/**
 * Resolves *where* the next insert should go, but deliberately stops short
 * of computing an actual Range for the container/component cases. Deriving
 * a Range from a content control's boundary (via getRange(content)/select/
 * etc.) is what kept breaking on Word Web — collapsed selections and
 * content-range endpoints at a CC edge get interpreted inconsistently by
 * insertParagraph.
 *
 * Instead, for anything going inside a container we hand back either:
 *   - the specific child ContentControl the cursor was last on
 *     (mode: "after-component") — the caller inserts the new paragraph as
 *     a SIBLING immediately after that component via
 *     `component.insertParagraph(text, InsertLocation.after)`, so it lands
 *     in the middle of the existing components (right next to the one the
 *     cursor is on) instead of always being appended at the end, and
 *     without nesting inside that component.
 *   - or the container itself (mode: "container") when there's no more
 *     specific active component to anchor to — the caller appends with
 *     `container.insertParagraph(text, InsertLocation.end)`, Word's own
 *     sanctioned "add a child to this content control" method, which isn't
 *     subject to the boundary ambiguity a derived Range has.
 */
async function getInsertionTarget(context, componentId, activeContainerIdRef, activeComponentIdRef) {
  if (isContainerComponent(componentId)) {
    const lastContainer = await getLastContainerControl(context);

    if (lastContainer) {
      // Every opener/non-opener must start on its own page. Insert a page
      // break right after the previous container first, then always
      // append the new container at the very end of the document body —
      // which, once the break above has been committed, is a fresh page.
      lastContainer.getRange().insertBreak(Word.BreakType.page, Word.InsertLocation.after);
      await context.sync();
    }

    return {
      mode: "body",
      range: context.document.body.getRange(Word.RangeLocation.end),
      location: Word.InsertLocation.before,
    };
  }

  // 1. Prefer the explicitly-tracked active container (reliable cross-batch,
  //    works the same on Desktop and Web).
  const activeContainerId = activeContainerIdRef?.current;
  const trackedContainer = await getContainerById(context, activeContainerId);

  if (trackedContainer) {
    // 1a. Within that container, prefer inserting right after the specific
    //     child component the cursor was last known to be on, so the new
    //     component lands next to it (mid-container) instead of always
    //     jumping to the end of the container.
    const trackedComponent = await getComponentById(context, activeComponentIdRef?.current);
    if (trackedComponent) {
      return { mode: "after-component", component: trackedComponent, container: trackedContainer };
    }

    // No specific active component (e.g. cursor is on the container itself,
    // or the container is still empty) — fall back to appending at the end.
    return { mode: "container", container: trackedContainer };
  }

  // 2. Fall back to the live selection (covers the case where the user
  //    manually clicked into a container and our selection-changed handler
  //    hasn't been registered/fired yet — e.g. very first insert of a
  //    session, or a platform where addHandlerAsync isn't available).
  const selection = context.document.getSelection();
  const { container, selectedComponent } = await getContentControlContext(context, selection);

  if (!container) {
    const err = new Error("OUTSIDE_CONTAINER");
    err.code = "OUTSIDE_CONTAINER";
    throw err;
  }

  if (selectedComponent) {
    return { mode: "after-component", component: selectedComponent, container };
  }

  return { mode: "container", container };
}

/**
 * Creates the anchor paragraph for a new component, using whichever
 * mechanism matches the target:
 *  - "body": a normal, boundary-free Range insert (used only for the
 *    opener/non-opener containers themselves, appended at the document's
 *    top level — this has always worked reliably).
 *  - "after-component": `ContentControl.insertParagraph(text,
 *    InsertLocation.after)` on the specific child component the cursor was
 *    last on, adding the new paragraph as a sibling immediately after it
 *    (never nested inside it).
 *  - "container": `ContentControl.insertParagraph`, which safely adds a
 *    new child paragraph inside that specific content control regardless
 *    of whether it already has content, without touching a derived Range
 *    at the control's boundary.
 */
function createAnchorParagraph(target, initialText) {
  if (target.mode === "after-component") {
    return target.component.insertParagraph(initialText ?? "", Word.InsertLocation.after);
  }
  if (target.mode === "container") {
    return target.container.insertParagraph(initialText ?? "", Word.InsertLocation.end);
  }
  return target.range.insertParagraph(initialText ?? "", target.location);
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

async function insertComponent(
  id,
  COMPONENTS,
  COMPONENT_CONFIG,
  STYLES,
  layoutContext,
  activeContainerIdRef,
  activeComponentIdRef
) {
  return Word.run(async (context) => {
    const target = await getInsertionTarget(context, id, activeContainerIdRef, activeComponentIdRef);
    const meta = buildMeta(id, COMPONENTS, layoutContext);
    const config = COMPONENT_CONFIG[id] || { style: {} };

    const cc = await insertComponentAtTarget(target, context, id, meta, config, STYLES);
    await context.sync();

    if (cc) {
      cc.load("id");
      await context.sync();

      if (meta.container && activeContainerIdRef) {
        // If we just created a new container, it becomes the active
        // container for subsequent inserts, and it starts out with no
        // active child component yet.
        activeContainerIdRef.current = cc.id;
        if (activeComponentIdRef) {
          activeComponentIdRef.current = null;
        }
      } else if (activeComponentIdRef) {
        // Otherwise, the component we just inserted becomes the new
        // "cursor is here" anchor, so the next insert (if the user doesn't
        // click elsewhere first) lands right after it.
        activeComponentIdRef.current = cc.id;
      }
    }
  });
}

/**
 * Inserts a brand-new opener/non-opener container, then inserts the
 * originally-requested child component *inside* it.
 *
 * The container's content-control id is captured immediately after
 * creation and used directly to target the child insert — no dependency
 * on document selection surviving the round trip, which is what makes
 * this reliable on Word Online as well as Desktop.
 */
async function insertComponentInsideNewContainer(
  containerType,
  childId,
  childComponents,
  childComponentConfig,
  childStyles,
  activeContainerIdRef,
  activeComponentIdRef,
  log = () => { }
) {
  return Word.run(async (context) => {
    // 1. Create the container itself (opener / non-opener), always appended
    //    after the last container in the document.
    log(`[nested-insert] resolving target for container "${containerType}"`);
    const containerTarget = await getInsertionTarget(context, containerType, activeContainerIdRef, activeComponentIdRef);
    const containerMeta = buildMeta(containerType, LAYOUT_COMPONENTS, containerType);
    log(`[nested-insert] inserting container "${containerType}"`);

    const containerCc = await insertStyledComponent(
      containerTarget,
      context,
      containerMeta,
      { style: {} }
    );
    containerCc.load("id");
    await context.sync();
    log(`[nested-insert] container inserted, id=${containerCc.id}`);

    // Immediately mark this new container as active, both for this insert
    // and for any subsequent ones. It has no active child yet.
    if (activeContainerIdRef) {
      activeContainerIdRef.current = containerCc.id;
    }
    if (activeComponentIdRef) {
      activeComponentIdRef.current = null;
    }

    // 2. Insert the child directly into the container we just created.
    //    `containerCc` is a real ContentControl object at this point (not a
    //    derived Range), so `mode: "container"` routes this through
    //    `ContentControl.insertParagraph`, same as every other insert into
    //    a container — no selection or boundary Range involved.
    log(`[nested-insert] resolving target for child "${childId}"`);
    const childTarget = { mode: "container", container: containerCc };
    const childMeta = buildMeta(childId, childComponents, containerType);
    const childConfig = childComponentConfig[childId] || { style: {} };

    log(`[nested-insert] inserting child "${childId}"`);
    const childCc = await insertComponentAtTarget(
      childTarget,
      context,
      childId,
      childMeta,
      childConfig,
      childStyles
    );
    await context.sync();

    if (childCc && activeComponentIdRef) {
      childCc.load("id");
      await context.sync();
      activeComponentIdRef.current = childCc.id;
    }
    log(`[nested-insert] child inserted successfully`);
  });
}

async function insertComponentAtTarget(target, context, id, meta, config, STYLES) {
  if (id === "bullet-list") {
    return insertBulletItem(target, context, meta, STYLES);
  }

  if (config.dual) {
    return insertDualTextComponent(
      target,
      context,
      meta,
      config.dual
    );
  }

  return insertStyledComponent(
    target,
    context,
    meta,
    config
  );
}

async function insertStyledComponent(target, context, meta, config) {
  // For containers (opener/non-opener), the wrapping paragraph must have
  // real, non-empty content from the very start so the container never
  // shows Word's built-in "Click or tab here to enter text" placeholder
  // hint before anything is inserted into it.
  const initialText = meta.container ? (meta.placeholder || " ") : meta.placeholder;

  const paragraph = createAnchorParagraph(target, initialText);
  const cc = paragraph.insertContentControl();
  cc.title = meta.label;
  cc.tag = JSON.stringify(meta);
  cc.appearance = Word.ContentControlAppearance.boundingBox;
  cc.cannotDelete = false;
  cc.cannotEdit = false;
  await context.sync();

  if (meta.container) {
    // No selection juggling needed here — activeContainerIdRef (set by the
    // caller right after this returns) is what makes this container the
    // target for the next insert, not the document selection.
    return cc;
  }

  const body = cc.getRange();
  body.insertText(" ", Word.InsertLocation.end);
  if (config.style) {
    applyStyle(body, config.style);
  }
  await context.sync();
  return cc;
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

async function insertDualTextComponent(target, context, meta, config) {
  const paragraph = createAnchorParagraph(target, config.text);
  const prefixRange = paragraph.insertText(config.prefix, Word.InsertLocation.start);
  const fullRange = paragraph.getRange();
  applyStyle(fullRange, config.textStyle);
  applyStyle(prefixRange, config.prefixStyle);
  await context.sync();
  const cc = wrapInContentControl(paragraph, meta);
  await context.sync();
  return cc;
}

/**
 * Core figure-image insertion logic, decoupled from how the insertion
 * target was resolved. Shared by insertFigureImage (inserts into whichever
 * container/component is already active) and insertContainerThenImage
 * (creates a brand-new container first, then inserts into it) so the two
 * flows can never drift apart.
 */
async function insertImageAtTarget(target, context, base64, meta) {
  // 1. Create the anchor paragraph and insert the image into it.
  const imagePara = createAnchorParagraph(target, "");
  const img = imagePara.insertInlinePictureFromBase64(base64, Word.InsertLocation.start);
  img.width = 414;
  img.alignment = Word.Alignment.centered;
  await context.sync();

  // 2. Wrap ONLY the image paragraph in its content control first — same
  //    boundary-safe pattern used everywhere else in this file
  //    (wrapInContentControl). We deliberately do NOT build a combined
  //    Range via startRange.expandTo(endRange) across two independently
  //    created paragraphs: that derived Range can snap outward to the
  //    surrounding container's own boundary on Word Web, which is what
  //    caused the figure content control to wrap the whole container
  //    instead of just the image + caption.
  const cc = wrapInContentControl(imagePara, meta);
  await context.sync();

  // 3. Add the caption as a genuine child of the figure's own content
  //    control via ContentControl.insertParagraph — the same
  //    "sanctioned add-a-child" method used for container inserts
  //    elsewhere in the file — so the caption ends up nested inside the
  //    figure's cc, not outside it.
  const captionPara = cc.insertParagraph(" Caption text here.", Word.InsertLocation.end);
  const caption = captionPara.insertText("FIGURE 1.1", Word.InsertLocation.start);
  caption.font.bold = true;
  caption.font.color = "#C00000";
  captionPara.font.size = 10;
  caption.font.size = 10;
  await context.sync();
  return cc;
}

async function insertFigureImage(base64, COMPONENTS, layoutContext, activeContainerIdRef, activeComponentIdRef) {
  return Word.run(async (context) => {
    const meta = buildMeta("image", COMPONENTS, layoutContext);
    // Same rule as every other component: if there's no active container to
    // insert into, this throws OUTSIDE_CONTAINER so the caller can prompt
    // the user to pick/create an Opener or Non Opener first.
    const target = await getInsertionTarget(context, "image", activeContainerIdRef, activeComponentIdRef);
    const cc = await insertImageAtTarget(target, context, base64, meta);

    if (cc && activeComponentIdRef) {
      cc.load("id");
      await context.sync();
      activeComponentIdRef.current = cc.id;
    }
  });
}

/**
 * Creates a brand-new opener/non-opener container, then inserts the figure
 * image inside it. Used by the "Select Container" modal when the pending
 * component was an image and there was no active container to insert into.
 */
async function insertContainerThenImage(
  containerType,
  base64,
  COMPONENTS,
  layoutContext,
  activeContainerIdRef,
  activeComponentIdRef,
  log = () => { }
) {
  return Word.run(async (context) => {
    log(`[nested-insert] resolving target for container "${containerType}"`);
    const containerTarget = await getInsertionTarget(context, containerType, activeContainerIdRef, activeComponentIdRef);
    const containerMeta = buildMeta(containerType, LAYOUT_COMPONENTS, containerType);

    const containerCc = await insertStyledComponent(
      containerTarget,
      context,
      containerMeta,
      { style: {} }
    );
    containerCc.load("id");
    await context.sync();
    log(`[nested-insert] container inserted, id=${containerCc.id}`);

    if (activeContainerIdRef) {
      activeContainerIdRef.current = containerCc.id;
    }
    if (activeComponentIdRef) {
      activeComponentIdRef.current = null;
    }

    const meta = buildMeta("image", COMPONENTS, containerType);
    const childTarget = { mode: "container", container: containerCc };
    const cc = await insertImageAtTarget(childTarget, context, base64, meta);

    if (cc && activeComponentIdRef) {
      cc.load("id");
      await context.sync();
      activeComponentIdRef.current = cc.id;
    }
    log(`[nested-insert] image inserted successfully`);
  });
}

async function insertBulletItem(target, context, meta, STYLES) {
  const p = createAnchorParagraph(target, "");
  const r = p.getRange();
  applyStyle(r, STYLES.bullestList);
  p.startNewList();
  p.listItem.level = 0;
  await context.sync();
  const cc = wrapInContentControl(p, meta);
  await context.sync();
  return cc;
}

/**
 * Core "Icon with Text" (logo-with-text) insertion logic, decoupled from
 * how the insertion target was resolved. Shared by insertLinkToLearning
 * (inserts into whichever container/component is already active) and
 * insertContainerThenLinkToLearning (creates a brand-new container first,
 * then inserts into it).
 */
async function insertLinkToLearningAtTarget(target, context, base64, mimeType, meta) {
  const platform = String(
    Office?.context?.platform || Office?.context?.diagnostics?.platform || ""
  ).toLowerCase();
  const isWordWeb = platform.includes("online") || platform.includes("web");

  // Anchor a real, throwaway paragraph first — either as a genuine child
  // of the container (via ContentControl.insertParagraph), immediately
  // after the active component, or at the document body level. This
  // paragraph is now a normal node in the document, not a boundary-derived
  // Range, so replacing ITS range with html/a table is safe wherever it
  // landed.
  const anchorParagraph = createAnchorParagraph(target, "");
  await context.sync();
  const anchorRange = anchorParagraph.getRange();

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
    const insertedRange = anchorRange.insertHtml(html, Word.InsertLocation.replace);
    await context.sync();
    const cc = wrapInContentControl(insertedRange, meta);
    await context.sync();
    return cc;
  }

  const table = anchorRange.insertTable(1, 2, Word.InsertLocation.replace, [["", " START TYPING..."]]);

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
  const cc = wrapInContentControl(table, meta);
  await context.sync();
  return cc;
}

async function insertLinkToLearning(base64, mimeType = "image/png", COMPONENTS, layoutContext, activeContainerIdRef, activeComponentIdRef) {
  return Word.run(async (context) => {
    const meta = buildMeta("logo-with-text", COMPONENTS, layoutContext);
    // Same rule as every other component: if there's no active container to
    // insert into, this throws OUTSIDE_CONTAINER so the caller can prompt
    // the user to pick/create an Opener or Non Opener first.
    const target = await getInsertionTarget(context, "logo-with-text", activeContainerIdRef, activeComponentIdRef);
    const cc = await insertLinkToLearningAtTarget(target, context, base64, mimeType, meta);

    if (cc && activeComponentIdRef) {
      cc.load("id");
      await context.sync();
      activeComponentIdRef.current = cc.id;
    }
  });
}

/**
 * Creates a brand-new opener/non-opener container, then inserts the
 * "Icon with Text" component inside it. Used by the "Select Container"
 * modal when the pending component was logo-with-text and there was no
 * active container to insert into.
 */
async function insertContainerThenLinkToLearning(
  containerType,
  base64,
  mimeType,
  COMPONENTS,
  layoutContext,
  activeContainerIdRef,
  activeComponentIdRef,
  log = () => { }
) {
  return Word.run(async (context) => {
    log(`[nested-insert] resolving target for container "${containerType}"`);
    const containerTarget = await getInsertionTarget(context, containerType, activeContainerIdRef, activeComponentIdRef);
    const containerMeta = buildMeta(containerType, LAYOUT_COMPONENTS, containerType);

    const containerCc = await insertStyledComponent(
      containerTarget,
      context,
      containerMeta,
      { style: {} }
    );
    containerCc.load("id");
    await context.sync();
    log(`[nested-insert] container inserted, id=${containerCc.id}`);

    if (activeContainerIdRef) {
      activeContainerIdRef.current = containerCc.id;
    }
    if (activeComponentIdRef) {
      activeComponentIdRef.current = null;
    }

    const meta = buildMeta("logo-with-text", COMPONENTS, containerType);
    const childTarget = { mode: "container", container: containerCc };
    const cc = await insertLinkToLearningAtTarget(childTarget, context, base64, mimeType, meta);

    if (cc && activeComponentIdRef) {
      cc.load("id");
      await context.sync();
      activeComponentIdRef.current = cc.id;
    }
    log(`[nested-insert] logo-with-text inserted successfully`);
  });
}

async function getCursorRange(context) {
  const selection = context.document.getSelection();
  selection.load("isEmpty");
  await context.sync();
  return selection;
}