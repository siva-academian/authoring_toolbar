import React, { useState, useRef } from "react";
import "./App.css";
import { THEME_TYPE, DEFAULT_THEME, LAYOUT_COMPONENTS } from "./constants";

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

const renderComponentCard = ({ comp, loading, handleCardClick, themeId }) => {
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
            <span
              className="component-card-preview"
              data-comp-id={comp.id}
              data-theme={themeId}
            >
              <span className="preview-figure-label">{comp.previewPrefix} </span>
              <span className="preview-figure-text">{comp.preview}</span>
            </span>
          ) : (
            <span
              className="component-card-preview"
              data-comp-id={comp.id}
              data-theme={themeId}
            >
              {comp.preview}
            </span>
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
  const [currentFilterTheme, setCurrentFilterTheme] = useState(
    () => Office?.context?.document?.settings.get("theme") || DEFAULT_THEME
  );
  const [showContainerModal, setShowContainerModal] = useState(false);
  const [pendingComponent, setPendingComponent] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState("2");
  const [tableCols, setTableCols] = useState("2");
  const abortControllerRef = useRef(null);
  // Whenever at least one of our components exists anywhere in the
  // document, the Filter dropdown locks to the theme those components
  // belong to (the other theme's option becomes disabled) so the user
  // can't mix stylings from both themes in the same file. Once every
  // inserted component has been removed and the document is empty again,
  // this flips back to false and both themes become selectable again.
  const [hasAnyComponent, setHasAnyComponent] = useState(false);

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
    THEME_TYPE[currentFilterTheme ?? DEFAULT_THEME] ||
    Object.values(THEME_TYPE).find((page) => page.id === currentFilterTheme) ||
    THEME_TYPE[DEFAULT_THEME];
  const {
    COMPONENTS,
    STYLES,
    COMPONENT_CONFIG,
  } = pageConfig;

  // Runs once: create a stable document id if this doc doesn't have one yet.
  React.useEffect(() => {
    let docId = Office?.context?.document?.settings.get("appDocId");
    if (!docId) {
      docId = crypto.randomUUID();
      Office?.context?.document?.settings.set("appDocId", docId);
      Office?.context?.document?.settings.saveAsync();
    }
  }, []);

  // Runs every time the selected theme changes: keep it persisted.
  React.useEffect(() => {
    Office?.context?.document?.settings.set("theme", currentFilterTheme);
    Office?.context?.document?.settings.saveAsync();
  }, [currentFilterTheme]);

  // On load, check whether the document already contains any of our
  // components so the Filter dropdown starts out correctly locked (or
  // unlocked) instead of always defaulting to "both themes selectable".
  React.useEffect(() => {
    refreshThemeLockState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Best-effort: also refresh the theme-lock state whenever the user
      // clicks around the document. This is what picks up manual deletions
      // (which don't go through our insert code) so the Filter dropdown
      // re-enables once the document is empty of our components again.
      refreshThemeLockState();
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

  // Scans the whole document for any of our components (any content
  // control tagged with our schema) and figures out which theme they
  // belong to. If we find at least one, we lock the Filter dropdown to
  // that theme (disabling the other option) and make sure `currentFilterTheme`
  // matches it — this also covers the case where the document already had
  // content when the add-in was (re)loaded. If none are found, the
  // document is effectively empty of our components and both themes
  // become selectable again.
  const refreshThemeLockState = async () => {
    try {
      await Word.run(async (context) => {
        const contentControls = context.document.body.contentControls;
        contentControls.load("items/tag");
        await context.sync();
        let foundThemeId = null;
        let theme = null;
        for (const cc of contentControls.items) {
          const meta = parseContentControlTag(cc.tag);
          // We only want to lock the Filter once an actual COMPONENT has been
          // placed inside an Opener/Non-Opener — not merely because an (empty)
          // Opener/Non-Opener container itself exists. Container content controls
          // carry meta.container === true; every child component inserted inside
          // one carries meta.container === false and can only ever have been
          // created by inserting into an existing container (insertion outside a
          // container throws OUTSIDE_CONTAINER), so finding one of these is a
          // reliable signal that a container is no longer empty.
          if (meta && !meta.container) {
            const resolvedPage =
              THEME_TYPE[theme] ||
              Object.values(THEME_TYPE).find((p) => p.id === theme);
            if (resolvedPage) {
              foundThemeId = resolvedPage.id;
              break;
            }
          } else if (theme === null && meta.container) {
            theme = meta.theme
          }
        }

        if (foundThemeId) {
          setHasAnyComponent(true);
          setCurrentFilterTheme((prev) => {
            const prevResolved =
              THEME_TYPE[prev] ||
              Object.values(THEME_TYPE).find((p) => p.id === prev) ||
              THEME_TYPE[DEFAULT_THEME];
            return prevResolved.id === foundThemeId ? prev : foundThemeId;
          });
        } else {
          setHasAnyComponent(false);
        }
      });
    } catch (err) {
      // Non-fatal — this is a best-effort UI lock, not core functionality.
    }
  };

  const log = (msg) =>
    setDebugInfo(
      (prev) =>
        `${new Date().toLocaleTimeString()}: ${typeof msg === "object" ? JSON.stringify(msg) : msg
        }\n` + prev
    );

  const handleCardClick = async (id,
    currentFilterTheme = "",
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
      if (id === "quotation") {
        // Quotation needs its own insertion logic (two separately tagged
        // content controls inside one bounding box) instead of the
        // generic single-content-control insertComponent flow.
        await insertQuotationComponent(
          components,
          componentConfig,
          currentFilterTheme,
          activeContainerIdRef,
          activeComponentIdRef
        );
        setStatus(`✓ "Quotation" inserted.`);
        return;
      }
      // Pass the current layout context so it gets embedded in the tag
      await insertComponent(
        id,
        components,
        componentConfig,
        styles,
        activeContainerIdRef,
        activeComponentIdRef,
        currentFilterTheme
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
      refreshThemeLockState();
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
        currentFilterTheme,
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
      refreshThemeLockState();
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
      await insertFigureImage(base64, COMPONENTS, currentFilterTheme, activeContainerIdRef, activeComponentIdRef);
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
      refreshThemeLockState();
    }
  };

  const handleTableClick = () => {
    setShowTableModal(true);
    setStatus("");
  };

  const handleTableInsert = async () => {
    const rows = parseInt(tableRows, 10);
    const cols = parseInt(tableCols, 10);
    if (!rows || rows < 1 || !cols || cols < 1) {
      setStatus("✗ Please enter valid rows and columns.");
      return;
    }
    setLoading("table");
    setStatus("");
    try {
      await insertTableComponent(rows, cols, COMPONENTS, currentFilterTheme, activeContainerIdRef, activeComponentIdRef);
      setStatus("✓ Table inserted.");
      setShowTableModal(false);
    } catch (err) {
      if (err.code === "OUTSIDE_CONTAINER") {
        setShowTableModal(false);
        setPendingComponent("table");
        setShowContainerModal(true);
        return;
      }
      setStatus(`✗ Error: ${err.message || "Table insert failed."}`);
    } finally {
      setLoading(null);
      setTimeout(() => setStatus(""), 2000);
      refreshThemeLockState();
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
    if (apiLoadingStatus) {
      abortControllerRef.current?.abort();
      setApiLoadingStatus(false);
      setApiType(null);
      return; // Prevent multiple simultaneous uploads
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

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
      let response;
      try {
        response = await fetch(transformUrl, {
          method: "POST",
          body: formData,
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(30000)
          ])
        });
      } catch (err) {
        if (err.name === "AbortError") {
          log("extraction Upload cancelled.");
          return;
        }
        log(`Fetch error details: ${err.message}`);
        setApiLoadingStatus(false);
        setApiType(null);
        throw err;
      };
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
          if (controller.signal.aborted) {
            throw new DOMException("Aborted", "AbortError");
          }
          const statusResponse = await fetch(statusUrl, {
            method: "GET",
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(30000)
            ])
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
      const templateId = currentFilterTheme;
      webHeaders.append("Content-Type", "application/json");
      const webOutputUrl = `${REACT_APP_WEB_BASE_URL}/${clickType === "PDF" ? "pdf" : "web"}`;
      log(`Uploading to: ${webOutputUrl}`);
      const webResponse = await fetch(webOutputUrl, {
        method: "POST",
        mode: "cors",
        headers: webHeaders,
        body: JSON.stringify({ documentId: documentId, tenantId, templateId }),
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(30000)
        ])
      }).catch((err) => {
        if (err.name === "AbortError") {
          log("Upload cancelled.");
          return;
        }
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

  const insertInsideNewContainer = async (containerType, currentFilterTheme) => {
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
          activeContainerIdRef,
          activeComponentIdRef,
          log,
          currentFilterTheme
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
          activeContainerIdRef,
          activeComponentIdRef,
          log,
          currentFilterTheme
        );
        setLinkImageFile(null);
        setLinkImagePreview(null);
        if (linkFileInputRef.current) linkFileInputRef.current.value = "";
        setStatus("✓ Logo with Text inserted.");
      } else if (pendingComponent === "table") {
        // Same pattern: create the container first, then insert the table
        // (with its merged, centered header row) inside it.
        const rows = parseInt(tableRows, 10) || 2;
        const cols = parseInt(tableCols, 10) || 2;
        await insertContainerThenTable(
          containerType,
          rows,
          cols,
          COMPONENTS,
          activeContainerIdRef,
          activeComponentIdRef,
          log,
          currentFilterTheme
        );
        setShowTableModal(false);
        setStatus("✓ Table inserted.");
      } else if (pendingComponent === "quotation") {
        // Same pattern: create the container first, then insert the
        // quotation (quote line + author line, each separately tagged)
        // inside it.
        await insertContainerThenQuotation(
          containerType,
          COMPONENTS,
          COMPONENT_CONFIG,
          activeContainerIdRef,
          activeComponentIdRef,
          log,
          currentFilterTheme
        );
        setStatus("✓ Quotation inserted.");
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
          log,
          currentFilterTheme
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
          activeContainerIdRef,
          activeComponentIdRef,
          currentFilterTheme
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
      refreshThemeLockState();
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
                  currentFilterTheme,
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
                  currentFilterTheme,
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
                value={currentFilterTheme}
                onChange={(e) => setCurrentFilterTheme(e.target.value)}
                title={hasAnyComponent ? "Remove all components to switch themes" : undefined}
              >
                {Object.values(THEME_TYPE).map((page) => (
                  <option
                    key={page.id}
                    value={page.id}
                    disabled={hasAnyComponent && page.id !== pageConfig.id}
                  >
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
                  renderComponentCard({ comp, loading, handleCardClick, themeId: pageConfig.id })
                )}
              </div>
            </section>
            <div className="section-divider" />
            <section className="component-section">
              <h2 className="section-heading">Text</h2>
              <div className="card-grid">
                {textMediaComponents.map((comp) =>
                  renderComponentCard({ comp, loading, handleCardClick, themeId: pageConfig.id })
                )}
                {currentFilterTheme === "theme2" && (
                  <button
                    className={`component-card${loading === "table" ? " component-card--loading" : ""}`}
                    onClick={handleTableClick}
                    disabled={!!loading}
                    aria-label="Insert Table"
                  >
                    <div className="component-card-top">
                      <span className="component-card-label">
                        {loading === "table" ? "Inserting…" : "Table"}
                      </span>
                    </div>
                  </button>
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
              Generate CDD
            </button>
            <button className="ai-buttons">
              Generate Blueprint
            </button>
            <button className="ai-buttons">
              Generate Lesson Content
            </button>
            <button className="ai-buttons">
              Improve CDD Draft
            </button>
            <button className="ai-buttons">
              Refine Module Blueprint
            </button>
          </section>
        ) : (
          <section className="component-section publish-panel">
            <div className="publish-actions">
              <button
                className={`footer-btn footer-btn--pdf ${apiLoadingStatus && apiType === "PDF" ? "footer-btn--loading" : ""}`}
                onClick={() => uploadDocument("PDF")}
              // disabled={apiType === "WEB" || apiLoadingStatus}
              >
                {apiLoadingStatus && apiType === "PDF" ? "Cancel PDF Generation.." : "Preview Lesson PDF"}
              </button>
              <button
                className={`footer-btn footer-btn--web ${apiLoadingStatus && apiType === "WEB" ? "footer-btn--loading" : ""}`}
                onClick={() => uploadDocument("WEB")}
              // disabled={apiLoadingStatus}
              >
                {apiLoadingStatus && apiType === "WEB" ? "Cancel Lesson Generation.." : "Preview Lesson"}
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
        showTableModal && (
          <div className="container-modal-overlay" onClick={() => setShowTableModal(false)}>
            <div className="image-modal" onClick={(e) => e.stopPropagation()}>
              <div className="image-modal-header">
                <h3>Insert Table</h3>
              </div>
              <section className="image-section">
                <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                  <label style={{ display: "flex", flexDirection: "column", fontSize: "13px" }}>
                    Rows
                    <input
                      type="number"
                      className="rows-input"
                      min="1"
                      max="20"
                      value={tableRows}
                      onChange={(e) => setTableRows(e.target.value)}
                      style={{ width: "70px", marginTop: "4px", padding: "4px" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", fontSize: "13px" }}>
                    Columns
                    <input
                      type="number"
                      className="cols-input"
                      min="1"
                      max="10"
                      value={tableCols}
                      onChange={(e) => setTableCols(e.target.value)}
                      style={{ width: "70px", marginTop: "4px", padding: "4px" }}
                    />
                  </label>
                </div>
                <div className="image-actions">
                  <button
                    className="insert-btn"
                    onClick={handleTableInsert}
                    disabled={loading === "table"}
                  >
                    {loading === "table" ? "Inserting…" : "Insert into Word"}
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setShowTableModal(false)}
                  >
                    Cancel
                  </button>
                </div>
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
                onClick={() => insertInsideNewContainer("opener", currentFilterTheme)}
              >
                Opener
              </button>
              <button
                onClick={() => insertInsideNewContainer("non-opener", currentFilterTheme)}
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
function buildMeta(id, COMPONENTS, currentFilterTheme = "") {
  const comp = COMPONENTS.find((c) => c.id === id);
  console.log({ comp }, { currentFilterTheme })
  return {
    type: id,
    label: comp?.label ?? id,
    preview: comp?.preview ?? "",
    version: "1.0",
    insertedAt: new Date().toISOString(),
    schema: "openstax-biology-chapter-formatter",
    placeholder: comp?.placeholder ?? "",
    theme: currentFilterTheme,
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
  activeContainerIdRef,
  activeComponentIdRef,
  currentFilterTheme
) {
  return Word.run(async (context) => {
    const target = await getInsertionTarget(context, id, activeContainerIdRef, activeComponentIdRef);
    const meta = buildMeta(id, COMPONENTS, currentFilterTheme);
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
  log = () => { },
  currentFilterTheme
) {
  return Word.run(async (context) => {
    // 1. Create the container itself (opener / non-opener), always appended
    //    after the last container in the document.
    log(`[nested-insert] resolving target for container "${containerType}"`);
    const containerTarget = await getInsertionTarget(context, containerType, activeContainerIdRef, activeComponentIdRef);
    const containerMeta = buildMeta(containerType, LAYOUT_COMPONENTS, currentFilterTheme);
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
    const childMeta = buildMeta(childId, childComponents, currentFilterTheme);
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

/**
 * Same idea as applyStyle, but deliberately leaves font.highlightColor
 * alone. Quotation's box background comes from paragraph.shading (a
 * paragraph-level fill), and applyStyle's habit of forcing highlightColor
 * to white when a style has no backgroundColor would paint a white
 * highlight behind every character and wash out that shading.
 */
function applyQuoteFont(range, style = {}) {
  range.font.name = style.font;
  range.font.size = style.size;
  range.font.color = style.color;
  range.font.bold = style.bold || false;
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

async function insertFigureImage(base64, COMPONENTS, currentFilterTheme, activeContainerIdRef, activeComponentIdRef) {
  return Word.run(async (context) => {
    const meta = buildMeta("image", COMPONENTS, currentFilterTheme);
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
  activeContainerIdRef,
  activeComponentIdRef,
  log = () => { },
  currentFilterTheme
) {
  return Word.run(async (context) => {
    log(`[nested-insert] resolving target for container "${containerType}"`);
    const containerTarget = await getInsertionTarget(context, containerType, activeContainerIdRef, activeComponentIdRef);
    const containerMeta = buildMeta(containerType, LAYOUT_COMPONENTS, currentFilterTheme);

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

    const meta = buildMeta("image", COMPONENTS, currentFilterTheme);
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

async function insertLinkToLearning(base64, mimeType = "image/png", COMPONENTS, currentFilterTheme, activeContainerIdRef, activeComponentIdRef) {
  return Word.run(async (context) => {
    const meta = buildMeta("logo-with-text", COMPONENTS, currentFilterTheme);
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
  activeContainerIdRef,
  activeComponentIdRef,
  log = () => { },
  currentFilterTheme
) {
  return Word.run(async (context) => {
    log(`[nested-insert] resolving target for container "${containerType}"`);
    const containerTarget = await getInsertionTarget(context, containerType, activeContainerIdRef, activeComponentIdRef);
    const containerMeta = buildMeta(containerType, LAYOUT_COMPONENTS, currentFilterTheme);

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

    const meta = buildMeta("logo-with-text", COMPONENTS, currentFilterTheme);
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

/**
 * Core table insertion logic, decoupled from how the insertion target was
 * resolved — same shared-core pattern used for images and logo-with-text.
 *
 * Uses the native Word.Table API (`Range.insertTable` + `Table.mergeCells`)
 * instead of a hand-built OOXML fragment. Raw `<w:tbl>` OOXML fragments
 * passed to `insertOoxml` are unreliable — they can silently fail or need
 * several seconds/keystrokes to materialize, especially on Word Online —
 * whereas `insertTable`/`mergeCells` are regular, fully-supported Word JS
 * API calls (WordApi 1.4+) that behave the same on Desktop and Web.
 */
async function insertTableAtTarget(target, context, rows, cols, meta) {
  // IMPORTANT: Word.Table has no insertContentControl() method — only
  // Body/Paragraph/Range/ContentControl do. So we can't build the table
  // first and wrap it afterwards (that silently threw and left a bare,
  // unwrapped table behind). Instead we wrap the anchor paragraph in the
  // content control FIRST, then use ContentControl.insertTable(...) — the
  // API Word provides specifically for placing a table inside/next to an
  // existing content control — so the table ends up properly bounded.
  const anchorParagraph = createAnchorParagraph(target, "");
  const cc = wrapInContentControl(anchorParagraph, meta);
  await context.sync();

  const data = Array.from({ length: rows }, () => Array.from({ length: cols }, () => " "));
  const table = cc.insertTable(rows, cols, Word.InsertLocation.end, data);
  await context.sync();

  // Simple visible grid, matching the styling used elsewhere in the file.
  [
    Word.BorderLocation.top,
    Word.BorderLocation.bottom,
    Word.BorderLocation.left,
    Word.BorderLocation.right,
    Word.BorderLocation.insideHorizontal,
    Word.BorderLocation.insideVertical,
  ].forEach((borderLocation) => {
    const border = table.getBorder(borderLocation);
    border.type = Word.BorderType.single;
    border.color = "#BFBFBF";
  });

  // Merge every cell in the first row into a single header cell spanning
  // the full table width, then center and bold its text.
  const headerCell = cols > 1 ? table.mergeCells(0, 0, 0, cols - 1) : table.getCell(0, 0);
  headerCell.body.clear();
  const headerRange = headerCell.body.insertText("Header", Word.InsertLocation.start);
  headerRange.font.bold = true;
  headerCell.body.paragraphs.getFirst().alignment = Word.Alignment.centered;
  await context.sync();

  return cc;
}

async function insertTableComponent(rows, cols, COMPONENTS, currentFilterTheme, activeContainerIdRef, activeComponentIdRef) {
  return Word.run(async (context) => {
    const meta = buildMeta("table", COMPONENTS, currentFilterTheme);
    // Same rule as every other component: if there's no active container to
    // insert into, this throws OUTSIDE_CONTAINER so the caller can prompt
    // the user to pick/create an Opener or Non Opener first.
    const target = await getInsertionTarget(context, "table", activeContainerIdRef, activeComponentIdRef);
    const cc = await insertTableAtTarget(target, context, rows, cols, meta);

    if (cc && activeComponentIdRef) {
      cc.load("id");
      await context.sync();
      activeComponentIdRef.current = cc.id;
    }
  });
}

/**
 * Creates a brand-new opener/non-opener container, then inserts the table
 * inside it. Used by the "Select Container" modal when the pending
 * component was a table and there was no active container to insert into.
 */
async function insertContainerThenTable(
  containerType,
  rows,
  cols,
  COMPONENTS,
  activeContainerIdRef,
  activeComponentIdRef,
  log = () => { },
  currentFilterTheme
) {
  return Word.run(async (context) => {
    log(`[nested-insert] resolving target for container "${containerType}"`);
    const containerTarget = await getInsertionTarget(context, containerType, activeContainerIdRef, activeComponentIdRef);
    const containerMeta = buildMeta(containerType, LAYOUT_COMPONENTS, currentFilterTheme);

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

    const meta = buildMeta("table", COMPONENTS, currentFilterTheme);
    const childTarget = { mode: "container", container: containerCc };
    const cc = await insertTableAtTarget(childTarget, context, rows, cols, meta);

    if (cc && activeComponentIdRef) {
      cc.load("id");
      await context.sync();
      activeComponentIdRef.current = cc.id;
    }
    log(`[nested-insert] table inserted successfully`);
  });
}

/**
 * Core quotation insertion logic, decoupled from how the insertion target
 * was resolved — same shared-core pattern used for images/tables.
 *
 * Produces ONE outer bounding content control (tag.type === "quotation")
 * that contains two independently-tagged child content controls nested
 * inside it: the quote line (tag.type === "quote-text") and the author
 * line (tag.type === "quote-author", tag.parent === "quotation"). Keeping
 * them as two separate content controls — instead of one blended
 * paragraph like the figure-caption/lesson-overview "dual" pattern — is
 * what lets the Python extraction pipeline pull the quote text and the
 * author line out separately and hand back clean JSON.
 */
async function insertQuotationAtTarget(target, context, COMPONENTS, config, currentFilterTheme) {
  const backgroundColor = config.backgroundColor || "#C9D9C5";
  const quoteStyle = config.quoteStyle || {};
  const authorStyle = config.authorStyle || {};

  // 1. The quote paragraph carries real content from the start and is
  //    wrapped as the outer "quotation" box FIRST — this is the same
  //    boundary-safe, no-leftover-blank-line pattern used for tables:
  //    wrap real content, don't wrap-then-fill an empty placeholder.
  const quotePara = createAnchorParagraph(target, "\u201CQuotation text goes here.\u201D");
  const outerMeta = buildMeta("quotation", COMPONENTS, currentFilterTheme);
  const outerCc = wrapInContentControl(quotePara, outerMeta);
  await context.sync();

  // 2. Add the author line as a genuine second child of the outer CC via
  //    ContentControl.insertParagraph — the same "sanctioned add-a-child"
  //    method used for containers/tables elsewhere in this file.
  const authorPara = outerCc.insertParagraph("\u2014Author Name, Source", Word.InsertLocation.end);
  await context.sync();

  // 3. Style both lines as one shared "box": same background shading and
  //    side padding, with the quote/author fonts kept distinct.
  [quotePara, authorPara].forEach((para) => {
    para.leftIndent = 14;
    para.rightIndent = 14;
    para.shading.backgroundColor = backgroundColor;
  });
  quotePara.spaceBefore = 12;
  quotePara.spaceAfter = 6;
  authorPara.spaceBefore = 0;
  authorPara.spaceAfter = 12;
  applyQuoteFont(quotePara.getRange(), quoteStyle);
  applyQuoteFont(authorPara.getRange(), authorStyle);
  await context.sync();

  // 4. Nest the quote and author lines EACH in their own content control,
  //    tagged distinctly, inside the outer "quotation" content control.
  const quoteMeta = { ...buildMeta("quote-text", [], currentFilterTheme), parent: "quotation" };
  wrapInContentControl(quotePara, quoteMeta);

  const authorMeta = { ...buildMeta("quote-author", [], currentFilterTheme), parent: "quotation" };
  wrapInContentControl(authorPara, authorMeta);

  await context.sync();
  return outerCc;
}

async function insertQuotationComponent(COMPONENTS, COMPONENT_CONFIG, currentFilterTheme, activeContainerIdRef, activeComponentIdRef) {
  return Word.run(async (context) => {
    // Same rule as every other component: if there's no active container to
    // insert into, this throws OUTSIDE_CONTAINER so the caller can prompt
    // the user to pick/create an Opener or Non Opener first.
    const target = await getInsertionTarget(context, "quotation", activeContainerIdRef, activeComponentIdRef);
    const config = COMPONENT_CONFIG["quotation"] || {};
    const cc = await insertQuotationAtTarget(target, context, COMPONENTS, config, currentFilterTheme);

    if (cc && activeComponentIdRef) {
      cc.load("id");
      await context.sync();
      activeComponentIdRef.current = cc.id;
    }
  });
}

/**
 * Creates a brand-new opener/non-opener container, then inserts the
 * quotation inside it. Used by the "Select Container" modal when the
 * pending component was a quotation and there was no active container to
 * insert into.
 */
async function insertContainerThenQuotation(
  containerType,
  COMPONENTS,
  COMPONENT_CONFIG,
  activeContainerIdRef,
  activeComponentIdRef,
  log = () => { },
  currentFilterTheme
) {
  return Word.run(async (context) => {
    log(`[nested-insert] resolving target for container "${containerType}"`);
    const containerTarget = await getInsertionTarget(context, containerType, activeContainerIdRef, activeComponentIdRef);
    const containerMeta = buildMeta(containerType, LAYOUT_COMPONENTS, currentFilterTheme);

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

    const config = COMPONENT_CONFIG["quotation"] || {};
    const childTarget = { mode: "container", container: containerCc };
    const cc = await insertQuotationAtTarget(childTarget, context, COMPONENTS, config, currentFilterTheme);

    if (cc && activeComponentIdRef) {
      cc.load("id");
      await context.sync();
      activeComponentIdRef.current = cc.id;
    }
    log(`[nested-insert] quotation inserted successfully`);
  });
}

async function getCursorRange(context) {
  const selection = context.document.getSelection();
  selection.load("isEmpty");
  await context.sync();
  return selection;
}