import React, { useState, useRef } from "react";
import "./App.css";
import { THEME_TYPE, DEFAULT_THEME, LAYOUT_COMPONENTS } from "./constants";

const REACT_APP_TENANT_ID = process.env.REACT_APP_TENANT_ID;
const REACT_APP_BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
const REACT_APP_WEB_BASE_URL = process.env.REACT_APP_WEB_BASE_URL;
const CONTAINER_COMPONENT_IDS = ["opener", "non-opener"];

const isContainerComponent = (id) => CONTAINER_COMPONENT_IDS.includes(id);

const IMAGE_WIDTH_MIN_PCT = 30;
const IMAGE_WIDTH_MAX_PCT = 100;
const DEFAULT_IMAGE_SETTINGS = {
  widthPct: 100,
  altText: "",
  position: "center",
};

const InstrcutionIcon = () => (
  <svg className="instruction-icon" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.71543 0 0 6.71602 0 15C0 23.284 6.71543 30 15 30C23.2846 30 30 23.2846 30 15C30 6.71543 23.2846 0 15 0ZM15 7.5C16.0354 7.5 16.875 8.33965 16.875 9.375C16.875 10.4104 16.0354 11.25 15 11.25C13.9646 11.25 13.125 10.4109 13.125 9.375C13.125 8.33906 13.9646 7.5 15 7.5ZM17.8125 22.5H12.1875C11.6695 22.5 11.25 22.0805 11.25 21.5625C11.25 21.0445 11.6695 20.625 12.1875 20.625H13.125V15H12.1875C11.6695 15 11.25 14.5805 11.25 14.0625C11.25 13.5445 11.6695 13.125 12.1875 13.125H15.9375C16.4555 13.125 16.875 13.5445 16.875 14.0625V20.625H17.8125C18.3305 20.625 18.75 21.0445 18.75 21.5625C18.75 22.0805 18.3305 22.5 17.8125 22.5Z" fill="#0E236C" />
  </svg>
);

const ImageIcon = () => (
  <svg width="60" height="60" viewBox="0 0 105 92" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M78.8553 42.6075V42.7373C72.7827 42.7373 67.0745 45.0769 62.7815 49.325C58.4873 53.5744 56.123 59.223 56.123 65.2321C56.123 69.7286 57.4478 74.0246 59.9141 77.6828H59.7574C59.6287 77.4911 59.5013 77.292 59.3765 77.0941C59.3625 77.0714 59.3485 77.0487 59.3344 77.026H12.5374C7.5234 77.026 3.44446 72.9897 3.44446 68.0281V12.4081C3.44446 7.44649 7.5234 3.41016 12.5374 3.41016H68.7433C73.7573 3.41016 77.8362 7.44649 77.8362 12.4081V42.6302C78.1738 42.615 78.5139 42.6075 78.8553 42.6075Z" fill="white" />
    <path d="M81.2821 12.4078V42.8631C80.4821 42.7799 79.672 42.737 78.8554 42.737C78.4707 42.737 78.0872 42.7471 77.7064 42.766V12.4078C77.7064 7.51802 73.686 3.53967 68.7447 3.53967H12.5375C7.59612 3.53967 3.57577 7.51802 3.57577 12.4078V68.0265C3.57577 72.9162 7.59612 76.8946 12.5375 76.8946H59.4084C59.4339 76.9374 59.4607 76.9816 59.4874 77.0244C59.625 77.245 59.7677 77.4644 59.9142 77.6812C60.5638 78.6455 61.2938 79.5645 62.0989 80.4317H12.5375C5.62416 80.4317 0 74.8663 0 68.0252V12.4078C0 5.56666 5.62416 0 12.5375 0H68.7434C75.6567 0 81.2821 5.56666 81.2821 12.4078Z" fill="#CADDE8" />
    <path d="M22.1847 15.0791C17.7593 15.0791 14.1593 18.6415 14.1593 23.0207C14.1593 27.3999 17.7593 30.9622 22.1847 30.9622C26.6102 30.9622 30.2101 27.3999 30.2101 23.0207C30.2101 18.6415 26.6102 15.0791 22.1847 15.0791Z" fill="#CADDE8" />
    <path d="M62.7815 49.3243C58.4873 53.5737 56.123 59.2223 56.123 65.2314C56.123 69.4619 57.295 73.5133 59.4873 77.0253H12.5374C7.5234 77.0253 3.44446 72.9889 3.44446 68.0274V57.5949L20.4405 42.1454C21.4035 41.2706 22.8545 41.2706 23.8163 42.1454L34.978 52.2917L57.1536 32.1327C58.1166 31.2591 59.5676 31.2591 60.5293 32.1327L73.0146 43.4841C69.1777 44.4863 65.6618 46.4767 62.7815 49.3268V49.3243Z" fill="#CADDE8" />
    <path d="M91.928 78.1668C99.1474 71.0228 99.1474 59.4401 91.928 52.2961C84.7086 45.1521 73.0036 45.1521 65.7842 52.2961C58.5648 59.4401 58.5648 71.0228 65.7842 78.1668C73.0036 85.3108 84.7086 85.3108 91.928 78.1668Z" fill="#CADDE8" />
    <path d="M86.9179 65.3817C86.2211 64.6921 85.086 64.6921 84.3892 65.3817L80.644 69.0877V57.1048C80.644 56.1291 79.8415 55.335 78.8555 55.335C77.8695 55.335 77.067 56.1291 77.067 57.1048V69.0877L73.3218 65.3817C72.9728 65.0363 72.5154 64.8648 72.0581 64.8648C71.6008 64.8648 71.1422 65.0375 70.7944 65.3817C70.4569 65.7157 70.2709 66.1607 70.2709 66.6334C70.2709 67.1061 70.4569 67.5499 70.7944 67.8839L77.5918 74.6103C78.2886 75.2998 79.4237 75.2998 80.1205 74.6103L86.9179 67.8839C87.2554 67.5499 87.4414 67.1049 87.4414 66.6334C87.4414 66.162 87.2554 65.717 86.9179 65.3817Z" fill="white" />
  </svg>
);

const LinkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_2367_1034)">
      <path d="M25.3848 0C16.7745 0 9.76953 7.00496 9.76953 15.6152C9.76953 19.489 11.1881 23.0372 13.532 25.7695L11.9482 27.3532L10.2494 25.6544L0 35.9038L5.09622 41L15.3456 30.7506L13.6468 29.0518L15.2305 27.468C17.9628 29.8122 21.511 31.2305 25.3848 31.2305C33.995 31.2305 41 24.2255 41 15.6152C41 7.00496 33.995 0 25.3848 0ZM5.09622 37.6026L3.39738 35.9038L10.2494 29.0518L11.9479 30.7506L5.09622 37.6026ZM25.3848 28.8281C18.0992 28.8281 12.1719 22.9008 12.1719 15.6152C12.1719 8.32969 18.0992 2.40234 25.3848 2.40234C32.6703 2.40234 38.5977 8.32969 38.5977 15.6152C38.5977 22.9008 32.6703 28.8281 25.3848 28.8281Z" fill="#525099" />
      <path d="M18.1777 9.60938H20.5801V13.8557L23.2192 15.6152L20.5801 17.3748V21.6211H18.1777V24.0234H32.5918V21.6211H30.1895V17.3748L27.5503 15.6152L30.1895 13.8557V9.60938H32.5918V7.20703H18.1777V9.60938ZM27.7871 18.6604V21.6211H22.9824V18.6604L25.3848 17.0588L27.7871 18.6604ZM27.7871 12.5701L25.3848 14.1716L22.9824 12.5701V9.60938H27.7871V12.5701Z" fill="#B12D2D" />
    </g>
    <defs>
      <clipPath id="clip0_2367_1034">
        <rect width="41" height="41" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const renderComponentCard = ({ comp, loading, handleCardClick, themeId }) => {
  if (!comp || comp.id === "image" || comp.id === "logo-with-text") return null;
  const isActive = loading === comp.id;

  return (
    <button
      key={comp.id}
      className={`component-card${isActive ? " component-card--loading" : ""}`}
      onClick={() => handleCardClick(comp.id, themeId)}
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
  const [imageSettings, setImageSettings] = useState(DEFAULT_IMAGE_SETTINGS);
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
  const abortControllerRef = useRef(null);
  const [hasAnyComponent, setHasAnyComponent] = useState(false);

  const activeContainerIdRef = useRef(null);
  const activeComponentIdRef = useRef(null);
  const activeAnchorPositionRef = useRef("after");
  const componentMetaCacheRef = useRef({});

  const pageConfig =
    THEME_TYPE[currentFilterTheme ?? DEFAULT_THEME] ||
    Object.values(THEME_TYPE).find((page) => page.id === currentFilterTheme) ||
    THEME_TYPE[DEFAULT_THEME];
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

  React.useEffect(() => {
    Office?.context?.document?.settings.set("theme", currentFilterTheme);
    Office?.context?.document?.settings.saveAsync();
  }, [currentFilterTheme]);

  React.useEffect(() => {
    refreshThemeLockState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              selectedComponent.load("id,tag");
            }
            await context.sync();

            let resolvedComponentId = selectedComponent ? selectedComponent.id : null;
            let resolvedAnchorPosition = "after";

            if (!selectedComponent) {
              const lastKnownComponentId = activeComponentIdRef.current;
              const lastKnownMeta = lastKnownComponentId
                ? componentMetaCacheRef.current[lastKnownComponentId]
                : null;
              let reclaimedCc = null;
              if (lastKnownMeta) {
                const stillExists = await getComponentById(context, lastKnownComponentId);
                if (!stillExists) {
                  reclaimedCc = await reclaimEscapedContent(
                    context,
                    container,
                    lastKnownMeta,
                    componentMetaCacheRef
                  );
                  if (reclaimedCc) {
                    resolvedComponentId = reclaimedCc.id;
                    resolvedAnchorPosition = "after";
                  }
                }
              }

              if (!reclaimedCc) {
                const { precedingComponent, followingComponent, containingComponent } = await findAdjacentComponents(
                  context,
                  container,
                  selection
                );
                if (containingComponent) {
                  containingComponent.load("id");
                  await context.sync();
                  resolvedComponentId = containingComponent.id;
                  resolvedAnchorPosition = "after";
                } else if (precedingComponent) {
                  precedingComponent.load("id");
                  await context.sync();
                  resolvedComponentId = precedingComponent.id;
                  resolvedAnchorPosition = "after";
                } else if (followingComponent) {
                  followingComponent.load("id");
                  await context.sync();
                  resolvedComponentId = followingComponent.id;
                  resolvedAnchorPosition = "before";
                } else {
                  resolvedComponentId = null;
                  resolvedAnchorPosition = "after";
                }
              }
            } else {
              const meta = parseContentControlTag(selectedComponent.tag);
              if (meta) {
                componentMetaCacheRef.current[selectedComponent.id] = meta;
                await reapplyStyleToComponent(context, selectedComponent, meta);
                await context.sync();
              }
              resolvedAnchorPosition = "after";
            }

            activeContainerIdRef.current = container.id;
            activeComponentIdRef.current = resolvedComponentId;
            activeAnchorPositionRef.current = resolvedAnchorPosition;
          }
        });
      } catch (err) {
        // Non-fatal — selection tracking is best-effort.
      }

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
          if (meta && !meta.container) {
            const resolvedPage =
              THEME_TYPE[theme] ||
              Object.values(THEME_TYPE).find((p) => p.id === theme);
            if (resolvedPage) {
              foundThemeId = resolvedPage.id;
              break;
            }
          } else if (theme === null && meta?.container) {
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
        await insertQuotationComponent(
          components,
          componentConfig,
          currentFilterTheme,
          activeContainerIdRef,
          activeComponentIdRef,
          activeAnchorPositionRef,
          componentMetaCacheRef
        );
        setStatus(`✓ "Quotation" inserted.`);
        return;
      }
      await insertComponent(
        id,
        components,
        componentConfig,
        styles,
        activeContainerIdRef,
        activeComponentIdRef,
        activeAnchorPositionRef,
        currentFilterTheme,
        componentMetaCacheRef
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
    setImageSettings(DEFAULT_IMAGE_SETTINGS);
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
        activeComponentIdRef,
        activeAnchorPositionRef,
        componentMetaCacheRef
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
    setImageSettings(DEFAULT_IMAGE_SETTINGS);
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
      await insertFigureImage(base64, COMPONENTS, currentFilterTheme, activeContainerIdRef, activeComponentIdRef, activeAnchorPositionRef, componentMetaCacheRef, imageSettings);
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
      return;
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
      const imageMetadata = await collectImageMetadata();
      formData.append("imageMetadata", JSON.stringify(imageMetadata));
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

          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      };

      const isSucceeded = await pollStatus();
      if (!isSucceeded) {
        log(`Stopping: extraction did not succeed.`);
        return;
      }

      const webHeaders = new Headers();
      const templateId = currentFilterTheme;
      webHeaders.append("Content-Type", "application/json");
      const webOutputUrl = `${REACT_APP_WEB_BASE_URL}/${clickType === "PDF" ? "pdf" : "web"}`;
      log(`Uploading to: ${webOutputUrl}`);
      const webResponse = await fetch(webOutputUrl, {
        method: "POST",
        mode: "cors",
        headers: webHeaders,
        body: JSON.stringify({ documentId: documentId, tenantId, templateId, imageMetadata }),
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
          activeAnchorPositionRef,
          log,
          currentFilterTheme,
          componentMetaCacheRef,
          imageSettings
        );
        setImageFile(null);
        setImagePreview(null);
        setShowImageModal(false);
        setStatus("✓ Figure image inserted.");
      } else if (pendingComponent === "logo-with-text") {
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
          activeAnchorPositionRef,
          log,
          currentFilterTheme,
          componentMetaCacheRef
        );
        setLinkImageFile(null);
        setLinkImagePreview(null);
        if (linkFileInputRef.current) linkFileInputRef.current.value = "";
        setStatus("✓ Logo with Text inserted.");
      } else if (pendingComponent === "quotation") {
        await insertContainerThenQuotation(
          containerType,
          COMPONENTS,
          COMPONENT_CONFIG,
          activeContainerIdRef,
          activeComponentIdRef,
          activeAnchorPositionRef,
          log,
          currentFilterTheme,
          componentMetaCacheRef
        );
        setStatus("✓ Quotation inserted.");
      } else if (pendingComponent) {
        await insertComponentInsideNewContainer(
          containerType,
          pendingComponent,
          COMPONENTS,
          COMPONENT_CONFIG,
          STYLES,
          activeContainerIdRef,
          activeComponentIdRef,
          activeAnchorPositionRef,
          log,
          currentFilterTheme,
          componentMetaCacheRef
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
          activeAnchorPositionRef,
          currentFilterTheme,
          componentMetaCacheRef
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
            style={{ display: "none" }}
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
              </div>
            </section>
            <div className="section-divider" />
            <section className="component-section">
              <h2 className="section-heading">Media</h2>
              <section className="image-section">
                <div
                  className={`drop-zone${isDragging ? " drop-zone--dragging" : ""}${imagePreview ? " drop-zone--has-image" : ""}`}
                  onClick={() => fileInputRef.current.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={imageSettings.altText || "preview"}
                      className="drop-zone-preview"
                      style={{
                        width: `${imageSettings.widthPct}%`,
                        marginLeft: imageSettings.position === "left" ? 0 : imageSettings.position === "right" ? "auto" : "auto",
                        marginRight: imageSettings.position === "right" ? 0 : imageSettings.position === "left" ? "auto" : "auto",
                        display: "block",
                      }}
                    />
                  ) : (
                    <>
                      <div className="drop-zone-icon">
                        {ImageIcon()}
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
                  <>
                    <div
                      className="image-adjust-panel"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="image-adjust-row">
                        <label className="image-adjust-label" htmlFor="image-width-slider">
                          Width :
                        </label>
                        <input
                          id="image-width-slider"
                          type="range"
                          className="image-width-slider"
                          min={IMAGE_WIDTH_MIN_PCT}
                          max={IMAGE_WIDTH_MAX_PCT}
                          step="1"
                          value={imageSettings.widthPct}
                          onChange={(e) =>
                            setImageSettings((prev) => ({
                              ...prev,
                              widthPct: Number(e.target.value),
                            }))
                          }
                        />
                        <span className="image-adjust-value">{imageSettings.widthPct}%</span>
                      </div>

                      <div className="image-adjust-row">
                        <label className="image-adjust-label" htmlFor="image-alt-text">
                          Alt Text :
                        </label>
                        <input
                          id="image-alt-text"
                          type="text"
                          className="image-alt-input"
                          placeholder="Describe this image"
                          value={imageSettings.altText}
                          onChange={(e) =>
                            setImageSettings((prev) => ({
                              ...prev,
                              altText: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="image-adjust-row">
                        <span className="image-adjust-label">Position : </span>
                        <div className="image-position-segmented" role="group" aria-label="Image position">
                          {["left", "center", "right"].map((pos) => (
                            <button
                              key={pos}
                              type="button"
                              className={`image-position-segment${imageSettings.position === pos ? " image-position-segment--active" : ""}`}
                              onClick={() =>
                                setImageSettings((prev) => ({ ...prev, position: pos }))
                              }
                            >
                              {pos.charAt(0).toUpperCase() + pos.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
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
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          setImageSettings(DEFAULT_IMAGE_SETTINGS);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </section>
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
                      : <span>{LinkIcon()}</span>
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
              >
                {apiLoadingStatus && apiType === "PDF" ? "Cancel PDF Generation.." : "Preview Chapter PDF"}
              </button>
              <button
                className={`footer-btn footer-btn--web ${apiLoadingStatus && apiType === "WEB" ? "footer-btn--loading" : ""}`}
                onClick={() => uploadDocument("WEB")}
              >
                {apiLoadingStatus && apiType === "WEB" ? "Cancel Chapter Generation.." : "Preview Chapter"}
              </button>
              <button className="footer-btn footer-btn--pdf" onClick={() => { }} style={{ display: "none" }}>
                Export EPUB
              </button>
              <button className="footer-btn footer-btn--pdf" onClick={() => { }} style={{ display: "none" }}>
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

async function resolveParentContentControlOrNull(context, range) {
  const cc = range.parentContentControlOrNullObject;
  cc.load("isNullObject");
  await context.sync();
  return cc.isNullObject ? null : cc;
}

async function getContentControlContext(context, selection) {
  let current = await resolveParentContentControlOrNull(context, selection);

  if (!current) {
    // A selection that exactly matches a content control's boundaries
    // (e.g. the whole component is highlighted) can make Word return a
    // null parent for the selection itself — a known boundary quirk.
    // Ask Word directly which content control(s) are fully contained
    // within the selection instead of probing the selection's edges
    // (probing an edge is ambiguous: it sits exactly on the boundary
    // with a sibling component and can resolve to the wrong one).
    const contained = selection.contentControls;
    contained.load("items");
    await context.sync();
    if (contained.items.length > 0) {
      current = contained.items[0];
    }
  }

  if (!current) {
    return { container: null, selectedComponent: null };
  }

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

    if (!meta?.parent) {
      selectedComponent = selectedComponent || current;
    }
    current = current.parentContentControlOrNullObject;
  }

  return { container: null, selectedComponent: null };
}

async function findAdjacentComponents(context, container, selectionRange) {
  const contentControls = container.contentControls;
  contentControls.load("items");
  await context.sync();

  let precedingComponent = null;
  let followingComponent = null;
  let containingComponent = null;

  for (const cc of contentControls.items) {
    cc.load("tag,id");
    // eslint-disable-next-line no-await-in-loop
    await context.sync();
    const meta = parseContentControlTag(cc.tag);
    if (!meta || meta.container || meta.parent) continue;

    const ccRange = cc.getRange();
    const comparison = ccRange.compareLocationWith(selectionRange);
    // eslint-disable-next-line no-await-in-loop
    await context.sync();

    const relation = comparison.value;
    if (relation === "Before") {
      precedingComponent = cc;
    } else if (relation === "After" && !followingComponent) {
      followingComponent = cc;
    } else if (relation !== "Before" && relation !== "After") {
      // The selection sits at least partly inside this component's own
      // range (e.g. "Equal", "Inside", "Contains", "Overlaps" — the exact
      // value depends on how much of the component's text is selected).
      // This IS the component the user has selected/highlighted, so it
      // takes priority over any Before/After neighbor.
      containingComponent = cc;
    }
  }

  return { precedingComponent, followingComponent, containingComponent };
}

async function getLastContainerControl(context) {
  const contentControls = context.document.body.contentControls;
  contentControls.load("items/tag");
  await context.sync();

  let lastContainer = null;
  for (const cc of contentControls.items) {
    const meta = parseContentControlTag(cc.tag);
    if (meta?.container) {
      lastContainer = cc;
    }
  }
  return lastContainer;
}

async function getContainerById(context, containerId) {
  if (!containerId) return null;
  const cc = context.document.contentControls.getByIdOrNullObject(containerId);
  cc.load("isNullObject");
  await context.sync();
  return cc.isNullObject ? null : cc;
}

async function getComponentById(context, componentId) {
  if (!componentId) return null;
  const cc = context.document.contentControls.getByIdOrNullObject(componentId);
  cc.load("isNullObject");
  await context.sync();
  return cc.isNullObject ? null : cc;
}

async function getInsertionTarget(context, componentId, activeContainerIdRef, activeComponentIdRef, activeAnchorPositionRef) {
  if (isContainerComponent(componentId)) {
    const lastContainer = await getLastContainerControl(context);

    if (lastContainer) {
      lastContainer.getRange().insertBreak(Word.BreakType.page, Word.InsertLocation.after);
      await context.sync();
    }

    return {
      mode: "body",
      range: context.document.body.getRange(Word.RangeLocation.end),
      location: Word.InsertLocation.before,
    };
  }

  const activeContainerId = activeContainerIdRef?.current;
  const trackedContainer = await getContainerById(context, activeContainerId);

  // Resolve from the LIVE selection first, every time. The tracked refs
  // are updated asynchronously by the DocumentSelectionChanged handler
  // (several Word.run/context.sync round-trips), so there is a window
  // right after the user selects a component — and before that handler has
  // finished running — where the refs still hold whatever was active
  // before that selection. Trusting them in that window anchors the insert
  // to the previously-active component instead of the one the user just
  // selected. The live selection reflects the true, current cursor
  // position and is checked first; the tracked refs remain as a fallback
  // for Word Online, where focus moving into the taskpane can reset the
  // document's ambient selection.
  const liveSelection = context.document.getSelection();
  const { container: liveContainer, selectedComponent: liveSelectedComponent } =
    await getContentControlContext(context, liveSelection);

  if (trackedContainer) {
    trackedContainer.load("id");
    if (liveContainer) {
      liveContainer.load("id");
    }
    await context.sync();

    if (liveContainer && liveContainer.id === trackedContainer.id) {
      if (liveSelectedComponent) {
        return { mode: "after-component", component: liveSelectedComponent, container: trackedContainer };
      }

      const { precedingComponent, followingComponent, containingComponent } = await findAdjacentComponents(
        context,
        trackedContainer,
        liveSelection
      );
      if (containingComponent) {
        return { mode: "after-component", component: containingComponent, container: trackedContainer };
      }
      if (precedingComponent) {
        return { mode: "after-component", component: precedingComponent, container: trackedContainer };
      }
      if (followingComponent) {
        return { mode: "before-component", component: followingComponent, container: trackedContainer };
      }
    }

    // The live selection didn't resolve usefully inside this container
    // (e.g. focus moved to the taskpane and Word Online reset the ambient
    // selection) — fall back to the tracked component ref.
    const trackedComponent = await getComponentById(context, activeComponentIdRef?.current);
    if (trackedComponent) {
      const anchorPosition = activeAnchorPositionRef?.current === "before" ? "before" : "after";
      return anchorPosition === "before"
        ? { mode: "before-component", component: trackedComponent, container: trackedContainer }
        : { mode: "after-component", component: trackedComponent, container: trackedContainer };
    }

    return { mode: "container", container: trackedContainer };
  }

  if (!liveContainer) {
    const err = new Error("OUTSIDE_CONTAINER");
    err.code = "OUTSIDE_CONTAINER";
    throw err;
  }

  if (liveSelectedComponent) {
    return { mode: "after-component", component: liveSelectedComponent, container: liveContainer };
  }

  const { precedingComponent, followingComponent, containingComponent } = await findAdjacentComponents(context, liveContainer, liveSelection);
  if (containingComponent) {
    return { mode: "after-component", component: containingComponent, container: liveContainer };
  }
  if (precedingComponent) {
    return { mode: "after-component", component: precedingComponent, container: liveContainer };
  }
  if (followingComponent) {
    return { mode: "before-component", component: followingComponent, container: liveContainer };
  }

  return { mode: "container", container: liveContainer };
}

async function createAnchorParagraph(target, initialText) {
  let paragraph;
  if (target.mode === "after-component") {
    paragraph = target.component.insertParagraph(initialText ?? "", Word.InsertLocation.after);
  } else if (target.mode === "before-component") {
    paragraph = target.component.insertParagraph(initialText ?? "", Word.InsertLocation.before);
  } else if (target.mode === "container") {
    paragraph = target.container.insertParagraph(initialText ?? "", Word.InsertLocation.end);
  } else {
    paragraph = target.range.insertParagraph(initialText ?? "", target.location);
  }

  const context = target.context || paragraph.context;
  paragraph.load("isListItem");
  await context.sync();

  if (paragraph.isListItem) {
    paragraph.detachFromList();
    await context.sync();
  }

  return paragraph;
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

async function focusContentControl(context, cc, location = Word.RangeLocation.end) {
  try {
    const range = cc.getRange(location);
    range.select();
    await context.sync();
  } catch (err) {
    // Non-fatal — cursor placement is a UX nicety, not core functionality.
  }
}

async function focusRange(context, quoteContentControl) {
  try {
    const range = quoteContentControl.getRange(Word.RangeLocation.start);
    range.select();
    await context.sync();
  } catch (err) {
    try {
      quoteContentControl.select();
      await context.sync();
    } catch (err2) {
      // Non-fatal — cursor placement is a UX nicety, not core functionality.
    }
  }
}

function buildMeta(id, COMPONENTS, currentFilterTheme = "") {
  const comp = COMPONENTS.find((c) => c.id === id);
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

function resolveThemePage(themeId) {
  return (
    THEME_TYPE[themeId] ||
    Object.values(THEME_TYPE).find((p) => p.id === themeId) ||
    THEME_TYPE[DEFAULT_THEME]
  );
}

async function reapplyStyleToComponent(context, cc, meta) {
  if (!meta || meta.container) return;
  if (
    meta.type === "image" ||
    meta.type === "logo-with-text" ||
    meta.type === "table" ||
    meta.type === "quotation" ||
    meta.type === "bullet-list" ||
    meta.type === "numbered-list"
  ) {
    return;
  }

  const themePage = resolveThemePage(meta.theme);

  if (meta.type === "quote-text" || meta.type === "quote-author") {
    const quoteConfig = themePage?.COMPONENT_CONFIG?.["quotation"] || {};
    const style = meta.type === "quote-text" ? quoteConfig.quoteStyle : quoteConfig.authorStyle;
    applyQuoteFont(cc.getRange(), style || {});
    return;
  }

  const config = themePage?.COMPONENT_CONFIG?.[meta.type] || {};

  if (config.dual) {
    return;
  }

  const range = cc.getRange();
  applyStyle(range, config.style || {});
}

async function reclaimEscapedContent(context, container, meta, componentMetaCacheRef) {
  if (!meta) return null;

  container.load("id");
  const paragraphs = container.body.paragraphs;
  paragraphs.load("items");
  await context.sync();

  for (const paragraph of paragraphs.items) {
    const paragraphRange = paragraph.getRange();
    paragraphRange.load("text");
    const parentCc = paragraphRange.parentContentControlOrNullObject;
    parentCc.load("isNullObject,id,tag");
    // eslint-disable-next-line no-await-in-loop
    await context.sync();

    const parentMeta = parentCc.isNullObject ? null : parseContentControlTag(parentCc.tag);
    const isEscaped = !parentMeta || parentMeta.type !== meta.type;
    const hasRealText = !!paragraphRange.text && paragraphRange.text.trim().length > 0;

    if (isEscaped && hasRealText) {
      const cc = wrapInContentControl(paragraph, meta);
      await context.sync();
      await reapplyStyleToComponent(context, cc, meta);
      await context.sync();
      cc.load("id");
      await context.sync();
      if (componentMetaCacheRef) {
        componentMetaCacheRef.current[cc.id] = meta;
      }
      await focusContentControl(context, cc);
      return cc;
    }
  }

  return null;
}

async function insertComponent(
  id,
  COMPONENTS,
  COMPONENT_CONFIG,
  STYLES,
  activeContainerIdRef,
  activeComponentIdRef,
  activeAnchorPositionRef,
  currentFilterTheme,
  componentMetaCacheRef
) {
  return Word.run(async (context) => {
    const target = await getInsertionTarget(context, id, activeContainerIdRef, activeComponentIdRef, activeAnchorPositionRef);
    const meta = buildMeta(id, COMPONENTS, currentFilterTheme);
    const config = COMPONENT_CONFIG[id] || { style: {} };

    const cc = await insertComponentAtTarget(target, context, id, meta, config, STYLES);
    await context.sync();

    if (cc) {
      cc.load("id");
      await context.sync();

      if (meta.container && activeContainerIdRef) {
        activeContainerIdRef.current = cc.id;
        if (activeComponentIdRef) {
          activeComponentIdRef.current = null;
        }
      } else if (activeComponentIdRef) {
        activeComponentIdRef.current = cc.id;
        if (activeAnchorPositionRef) {
          activeAnchorPositionRef.current = "after";
        }
      }
      if (componentMetaCacheRef) {
        componentMetaCacheRef.current[cc.id] = meta;
      }

      await focusContentControl(context, cc);
    }
  });
}

async function insertComponentInsideNewContainer(
  containerType,
  childId,
  childComponents,
  childComponentConfig,
  childStyles,
  activeContainerIdRef,
  activeComponentIdRef,
  activeAnchorPositionRef,
  log = () => { },
  currentFilterTheme,
  componentMetaCacheRef
) {
  return Word.run(async (context) => {
    log(`[nested-insert] resolving target for container "${containerType}"`);
    const containerTarget = await getInsertionTarget(context, containerType, activeContainerIdRef, activeComponentIdRef, activeAnchorPositionRef);
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

    if (activeContainerIdRef) {
      activeContainerIdRef.current = containerCc.id;
    }
    if (activeComponentIdRef) {
      activeComponentIdRef.current = null;
    }
    if (activeAnchorPositionRef) {
      activeAnchorPositionRef.current = "after";
    }

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
      if (activeAnchorPositionRef) {
        activeAnchorPositionRef.current = "after";
      }
      if (componentMetaCacheRef) {
        componentMetaCacheRef.current[childCc.id] = childMeta;
      }
      await focusContentControl(context, childCc);
    }
    log(`[nested-insert] child inserted successfully`);
  });
}

async function insertComponentAtTarget(target, context, id, meta, config, STYLES) {
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
  const initialText = meta.container ? (meta.placeholder || " ") : meta.placeholder;

  const paragraph = await createAnchorParagraph(target, "");
  const cc = paragraph.insertContentControl();
  cc.title = meta.label;
  cc.tag = JSON.stringify(meta);
  cc.appearance = Word.ContentControlAppearance.boundingBox;
  cc.cannotDelete = false;
  cc.cannotEdit = false;
  await context.sync();

  if (meta.container) {
    return cc;
  }
  const body = paragraph.getRange();
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

function applyQuoteFont(range, style = {}) {
  range.font.name = style.font || "Calibri";
  range.font.size = style.size || 11;
  range.font.color = style.color || "#000000";
  range.font.bold = style.bold || false;
  range.font.italic = style.italic || false;
  range.font.underline = Word.UnderlineType.none;
  range.font.highlightColor = null;
}

async function insertDualTextComponent(target, context, meta, config) {
  const paragraph = await createAnchorParagraph(target, config.text);
  const prefixRange = paragraph.insertText(config.prefix, Word.InsertLocation.start);
  const fullRange = paragraph.getRange();
  applyStyle(fullRange, config.textStyle);
  applyStyle(prefixRange, config.prefixStyle);
  await context.sync();
  const cc = wrapInContentControl(paragraph, meta);
  await context.sync();
  return cc;
}

async function insertImageAtTarget(target, context, base64, meta, imageSettings = DEFAULT_IMAGE_SETTINGS) {
  const settings = { ...DEFAULT_IMAGE_SETTINGS, ...imageSettings };
  const widthPct = clampImageWidthPct(settings.widthPct);

  const imagePara = await createAnchorParagraph(target, "");
  const img = imagePara.insertInlinePictureFromBase64(base64, Word.InsertLocation.start);
  img.width = Math.round((widthPct / 100) * 414);
  img.altTextDescription = settings.altText || "";
  imagePara.alignment = resolveWordAlignment(settings.position);
  await context.sync();

  const meta_ = { ...meta, image: { widthPct, altText: settings.altText || "", position: settings.position } };
  const cc = wrapInContentControl(imagePara, meta_);
  await context.sync();

  const captionPara = cc.insertParagraph(" Caption text here.", Word.InsertLocation.end);
  captionPara.alignment = Word.Alignment.left;
  const caption = captionPara.insertText("FIGURE 1.1", Word.InsertLocation.start);
  caption.font.bold = true;
  caption.font.color = "#C00000";
  captionPara.font.size = 10;
  caption.font.size = 10;
  await context.sync();
  return cc;
}

function clampImageWidthPct(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return DEFAULT_IMAGE_SETTINGS.widthPct;
  return Math.min(IMAGE_WIDTH_MAX_PCT, Math.max(IMAGE_WIDTH_MIN_PCT, Math.round(num)));
}

function resolveWordAlignment(position) {
  if (position === "left") return Word.Alignment.left;
  if (position === "right") return Word.Alignment.right;
  return Word.Alignment.centered;
}

function resolvePositionFromWordAlignment(alignment) {
  if (alignment === Word.Alignment.left || alignment === "Left") return "left";
  if (alignment === Word.Alignment.right || alignment === "Right") return "right";
  return "center";
}

async function insertFigureImage(base64, COMPONENTS, currentFilterTheme, activeContainerIdRef, activeComponentIdRef, activeAnchorPositionRef, componentMetaCacheRef, imageSettings) {
  return Word.run(async (context) => {
    const meta = buildMeta("image", COMPONENTS, currentFilterTheme);
    const target = await getInsertionTarget(context, "image", activeContainerIdRef, activeComponentIdRef, activeAnchorPositionRef);
    const cc = await insertImageAtTarget(target, context, base64, meta, imageSettings);

    if (cc && activeComponentIdRef) {
      cc.load("id");
      await context.sync();
      activeComponentIdRef.current = cc.id;
      if (activeAnchorPositionRef) {
        activeAnchorPositionRef.current = "after";
      }
      if (componentMetaCacheRef) {
        componentMetaCacheRef.current[cc.id] = { ...meta, image: imageSettings };
      }

      await focusContentControl(context, cc);
    }
  });
}

async function insertContainerThenImage(
  containerType,
  base64,
  COMPONENTS,
  activeContainerIdRef,
  activeComponentIdRef,
  activeAnchorPositionRef,
  log = () => { },
  currentFilterTheme,
  componentMetaCacheRef,
  imageSettings
) {
  return Word.run(async (context) => {
    log(`[nested-insert] resolving target for container "${containerType}"`);
    const containerTarget = await getInsertionTarget(context, containerType, activeContainerIdRef, activeComponentIdRef, activeAnchorPositionRef);
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
    if (activeAnchorPositionRef) {
      activeAnchorPositionRef.current = "after";
    }

    const meta = buildMeta("image", COMPONENTS, currentFilterTheme);
    const childTarget = { mode: "container", container: containerCc };
    const cc = await insertImageAtTarget(childTarget, context, base64, meta, imageSettings);

    if (cc && activeComponentIdRef) {
      cc.load("id");
      await context.sync();
      activeComponentIdRef.current = cc.id;
      if (activeAnchorPositionRef) {
        activeAnchorPositionRef.current = "after";
      }
      if (componentMetaCacheRef) {
        componentMetaCacheRef.current[cc.id] = { ...meta, image: imageSettings };
      }
      await focusContentControl(context, cc);
    }
    log(`[nested-insert] image inserted successfully`);
  });
}

async function insertLinkToLearningAtTarget(target, context, base64, mimeType, meta) {
  const platform = String(
    Office?.context?.platform || Office?.context?.diagnostics?.platform || ""
  ).toLowerCase();
  const isWordWeb = platform.includes("online") || platform.includes("web");

  const anchorParagraph = await createAnchorParagraph(target, "");
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

async function insertLinkToLearning(base64, mimeType = "image/png", COMPONENTS, currentFilterTheme, activeContainerIdRef, activeComponentIdRef, activeAnchorPositionRef, componentMetaCacheRef) {
  return Word.run(async (context) => {
    const meta = buildMeta("logo-with-text", COMPONENTS, currentFilterTheme);
    const target = await getInsertionTarget(context, "logo-with-text", activeContainerIdRef, activeComponentIdRef, activeAnchorPositionRef);
    const cc = await insertLinkToLearningAtTarget(target, context, base64, mimeType, meta);

    if (cc && activeComponentIdRef) {
      cc.load("id");
      await context.sync();
      activeComponentIdRef.current = cc.id;
      if (activeAnchorPositionRef) {
        activeAnchorPositionRef.current = "after";
      }
      if (componentMetaCacheRef) {
        componentMetaCacheRef.current[cc.id] = meta;
      }
      await focusContentControl(context, cc);
    }
  });
}

async function insertContainerThenLinkToLearning(
  containerType,
  base64,
  mimeType,
  COMPONENTS,
  activeContainerIdRef,
  activeComponentIdRef,
  activeAnchorPositionRef,
  log = () => { },
  currentFilterTheme,
  componentMetaCacheRef
) {
  return Word.run(async (context) => {
    log(`[nested-insert] resolving target for container "${containerType}"`);
    const containerTarget = await getInsertionTarget(context, containerType, activeContainerIdRef, activeComponentIdRef, activeAnchorPositionRef);
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
    if (activeAnchorPositionRef) {
      activeAnchorPositionRef.current = "after";
    }

    const meta = buildMeta("logo-with-text", COMPONENTS, currentFilterTheme);
    const childTarget = { mode: "container", container: containerCc };
    const cc = await insertLinkToLearningAtTarget(childTarget, context, base64, mimeType, meta);

    if (cc && activeComponentIdRef) {
      cc.load("id");
      await context.sync();
      activeComponentIdRef.current = cc.id;
      if (activeAnchorPositionRef) {
        activeAnchorPositionRef.current = "after";
      }
      if (componentMetaCacheRef) {
        componentMetaCacheRef.current[cc.id] = meta;
      }
      await focusContentControl(context, cc);
    }
    log(`[nested-insert] logo-with-text inserted successfully`);
  });
}

async function insertQuotationAtTarget(target, context, COMPONENTS, config, currentFilterTheme) {
  const backgroundColor = config.backgroundColor || "#C9D9C5";
  const quoteStyle = config.quoteStyle || {};
  const authorStyle = config.authorStyle || {};

  const quotePara = await createAnchorParagraph(target, "\u201CQuotation text goes here.\u201D");

  try {
    quotePara.style = "Normal";
    await context.sync();
  } catch (err) {
    // Non-fatal — proceed without the paragraph style reset.
  }

  const outerMeta = buildMeta("quotation", COMPONENTS, currentFilterTheme);
  const outerCc = wrapInContentControl(quotePara, outerMeta);
  await context.sync();

  const authorPara = outerCc.insertParagraph("  \u2014Author Name, Source", Word.InsertLocation.end);
  try {
    authorPara.style = "Normal";
    await context.sync();
  } catch (err) {
    // Non-fatal — proceed without the paragraph style reset.
  }

  [quotePara, authorPara].forEach((para) => {
    para.leftIndent = 8;
    para.rightIndent = 8;
  });
  quotePara.spaceBefore = 12;
  quotePara.spaceAfter = 6;
  authorPara.spaceBefore = 0;
  authorPara.spaceAfter = 12;
  applyQuoteFont(quotePara.getRange(), quoteStyle);
  applyQuoteFont(authorPara.getRange(), authorStyle);
  await context.sync();

  const applyBoxShading = async () => {
    try {
      [quotePara, authorPara].forEach((para) => {
        para.shading.backgroundColor = backgroundColor;
      });
      await context.sync();
    } catch (err) {
      // Non-fatal — background shading isn't supported on every Word host.
    }
  };
  await applyBoxShading();

  const quoteMeta = { ...buildMeta("quote-text", [], currentFilterTheme), parent: "quotation" };
  const quoteCc = wrapInContentControl(quotePara, quoteMeta);

  const authorMeta = { ...buildMeta("quote-author", [], currentFilterTheme), parent: "quotation" };
  const authorCc = wrapInContentControl(authorPara, authorMeta);

  await context.sync();

  await applyBoxShading();

  return { outerCc, quoteCc, authorCc, quoteMeta, authorMeta, quotePara };
}

async function insertQuotationComponent(COMPONENTS, COMPONENT_CONFIG, currentFilterTheme, activeContainerIdRef, activeComponentIdRef, activeAnchorPositionRef, componentMetaCacheRef) {
  return Word.run(async (context) => {
    const target = await getInsertionTarget(context, "quotation", activeContainerIdRef, activeComponentIdRef, activeAnchorPositionRef);
    const config = COMPONENT_CONFIG["quotation"] || {};
    const { outerCc, quoteCc, authorCc, quoteMeta, authorMeta } = await insertQuotationAtTarget(target, context, COMPONENTS, config, currentFilterTheme);

    if (activeComponentIdRef) {
      outerCc.load("id");
      quoteCc.load("id");
      authorCc.load("id");
      await context.sync();
      activeComponentIdRef.current = outerCc.id;
      if (activeAnchorPositionRef) {
        activeAnchorPositionRef.current = "after";
      }
      if (componentMetaCacheRef) {
        componentMetaCacheRef.current[quoteCc.id] = quoteMeta;
        componentMetaCacheRef.current[authorCc.id] = authorMeta;
      }
      await focusRange(context, quoteCc);
    }
  });
}

async function insertContainerThenQuotation(
  containerType,
  COMPONENTS,
  COMPONENT_CONFIG,
  activeContainerIdRef,
  activeComponentIdRef,
  activeAnchorPositionRef,
  log = () => { },
  currentFilterTheme,
  componentMetaCacheRef
) {
  return Word.run(async (context) => {
    log(`[nested-insert] resolving target for container "${containerType}"`);
    const containerTarget = await getInsertionTarget(context, containerType, activeContainerIdRef, activeComponentIdRef, activeAnchorPositionRef);
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
    if (activeAnchorPositionRef) {
      activeAnchorPositionRef.current = "after";
    }

    const config = COMPONENT_CONFIG["quotation"] || {};
    const childTarget = { mode: "container", container: containerCc };
    const { outerCc, quoteCc, authorCc, quoteMeta, authorMeta } = await insertQuotationAtTarget(childTarget, context, COMPONENTS, config, currentFilterTheme);
    if (activeComponentIdRef) {
      outerCc.load("id");
      quoteCc.load("id");
      authorCc.load("id");
      await context.sync();
      activeComponentIdRef.current = outerCc.id;
      if (activeAnchorPositionRef) {
        activeAnchorPositionRef.current = "after";
      }
      if (componentMetaCacheRef) {
        componentMetaCacheRef.current[quoteCc.id] = quoteMeta;
        componentMetaCacheRef.current[authorCc.id] = authorMeta;
      }
      await focusRange(context, quoteCc);
    }
    log(`[nested-insert] quotation inserted successfully`);
  });
}

async function collectImageMetadata() {
  const metadata = [];
  try {
    await Word.run(async (context) => {
      const contentControls = context.document.body.contentControls;
      contentControls.load("items/id,items/tag");
      await context.sync();

      for (const cc of contentControls.items) {
        const meta = parseContentControlTag(cc.tag);
        if (!meta || meta.type !== "image") continue;

        const pictures = cc.inlinePictures;
        pictures.load("items/width,items/altTextDescription");
        const paragraphs = cc.body.paragraphs;
        paragraphs.load("items/alignment");
        // eslint-disable-next-line no-await-in-loop
        await context.sync();

        const picture = pictures.items[0];
        const paragraph = paragraphs.items[0];
        const widthPct = picture ? clampImageWidthPct((picture.width / 414) * 100) : (meta.image?.widthPct ?? DEFAULT_IMAGE_SETTINGS.widthPct);
        const altText = picture ? (picture.altTextDescription || "") : (meta.image?.altText ?? "");
        const position = paragraph ? resolvePositionFromWordAlignment(paragraph.alignment) : (meta.image?.position ?? DEFAULT_IMAGE_SETTINGS.position);

        metadata.push({
          id: cc.id,
          widthPct,
          altText,
          position,
        });
      }
    });
  } catch (err) {
    // Best-effort — if this fails, ship the upload without per-image metadata.
  }
  return metadata;
}

async function getCursorRange(context) {
  const selection = context.document.getSelection();
  selection.load("isEmpty");
  await context.sync();
  return selection;
}