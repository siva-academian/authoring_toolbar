export const THEME1_COMPONENTS = [
  {
    id: "chapter-number",
    label: "Chapter Number",
    preview: "Chapter 1",
    category: "header",
    placeholder: "Chapter 1",
  },
  {
    id: "chapter-title",
    label: "Chapter Title",
    preview: "Introduction to Biology",
    category: "header",
    placeholder: "Introduction to Biology"
  },
  {
    id: "chapter-overview",
    label: "Chapter Overview",
    preview: "CHAPTER OUTLINE",
    category: "header",
    placeholder: "CHAPTER OUTLINE",
  },
  {
    id: "lesson-overview",
    label: "Lesson Overview",
    preview: "1.1 Topic Title",
    category: "header",
    placeholder: "1.1 Topic Title",
  },
  {
    id: "lesson-title",
    label: "Lesson Title",
    preview: "1.1 Themes and Concepts of Biology",
    category: "header",
    placeholder: "1.1 Themes and Concepts of Biology",
  },
  {
    id: "section-title",
    label: "Section Title",
    preview: "Properties of Life",
    category: "header",
    placeholder: "Properties of Life",
  },
  {
    id: "paragraph-text",
    label: "Paragraph Text",
    preview: "Start typing your text here...",
    category: "text-media",
    placeholder: "",
  },
  {
    id: "image",
    label: "Image",
    preview: null,
    category: "text-media",
    placeholder: null,
  },
  {
    id: "figure-caption",
    label: "Caption",
    preview: "caption",
    previewPrefix: "FIGURE 1.1",
    category: "text-media",
    placeholder: "FIGURE 1.1",
  },
  {
    id: "bullet-list",
    label: "Bullet List",
    preview: "• Type your list item here",
    category: "text-media",
    placeholder: "• ",
  },
  {
    id: "quotation",
    label: "Quotation",
    preview: "Quotation text goes here.",
    previewPrefix: null,
    category: "text-media",
    placeholder: "",
  },
  {
    id: "footer",
    label: "Footer",
    preview: "“Footer text goes here.”",
    previewPrefix: null,
    category: "text-media",
    placeholder: "",
  },
  {
    id: "logo-with-text",
    label: "Logo with Text",
    description: "Small logo + editable learning link text",
    preview: "logo  Start typing...",
    category: "header",
    placeholder: "",
  },
];

export const THEME1_STYLES = {
  chapterHeading: {
    font: "Arial",
    size: 15,
    color: "#0074BC",
    bold: false,
  },
  chapterTitle: {
    font: "Arial",
    size: 22,
    color: "#000000",
    bold: false,
  },
  chapterOverview: {
    font: "Arial",
    size: 9,
    color: "#0074BC",
    bold: true,
  },
  lessonOverview: {
    font: "Arial",
    size: 9,
    color: "#000000",
    bold: true,
  },
  lessonTitle: {
    font: "Arial",
    size: 12,
    color: "#0074BC",
    bold: false,
  },
  sectionTitle: {
    font: "Arial",
    size: 11,
    color: "#0074BC",
    bold: false,
  },
  paragrapghText: {
    // Updated per style table: font family changed from "Arial" to
    // "IBM Flex Sans Regular" for Theme 1 body paragraphs.
    font: "IBM Flex Sans Regular,Arial",
    size: 9,
    color: "#000000",
    bold: false,
  },
  bullestList: {
    font: "Arial",
    size: 9,
    color: "#000000",
    bold: false,
  },
  imageFigureNumber: {
    font: "Arial",
    size: 7.5,
    color: "#C31427",
    bold: true,
  },
  imageFigureText: {
    font: "Arial",
    size: 7.5,
    color: "#000000",
    bold: false,
  },
  // New: Quotation styling — the quote line and the author line are each
  // wrapped in their own content control (see App.js insertQuotationAtTarget),
  // so they're kept as two separate style objects rather than one dual
  // prefix/text pair like figure-caption / lesson-overview use.
  quotationText: {
    font: "Georgia,Arial",
    size: 13,
    color: "#1A1A1A",
    bold: false,
  },
  quotationAuthor: {
    font: "Arial",
    size: 10.5,
    color: "#1A1A1A",
    bold: false,
  },
  footer: {
    font: "Arial",
    size: 9,
    color: "#1A1A1A",
    bold: false,
  },
};

export const THEME1_COMPONENT_CONFIG = {
  "chapter-number": {
    style: THEME1_STYLES.chapterHeading,
    allCaps: true,
  },
  "chapter-title": {
    style: THEME1_STYLES.chapterTitle,
  },
  "chapter-overview": {
    style: THEME1_STYLES.chapterOverview,
    allCaps: true,
  },
  "lesson-overview": {
    style: THEME1_STYLES.lessonOverview,
  },
  "lesson-title": {
    style: THEME1_STYLES.lessonTitle,
    allCaps: true,
  },
  "paragraph-text": {
    style: THEME1_STYLES.paragrapghText,
  },
  "section-title": {
    style: THEME1_STYLES.sectionTitle,
  },
  "figure-caption": {
    dual: {
      prefix: "FIGURE 1.1",
      text: " Caption text here.",
      prefixStyle: THEME1_STYLES.imageFigureNumber,
      textStyle: THEME1_STYLES.imageFigureText,
    }
  },
  // New: background/box color + per-line text styles used by
  // insertQuotationAtTarget in App.js.
  "quotation": {
    backgroundColor: "#C9D9C5",
    quoteStyle: THEME1_STYLES.quotationText,
    authorStyle: THEME1_STYLES.quotationAuthor,
  },
  "footer": {
    style: THEME1_STYLES.footer,
  },
};

export const THEME2_COMPONENTS = [
  {
    id: "part-number",
    label: "Part Number",
    preview: "Part 1",
    category: "header",
    placeholder: "Part 1",
  },
  {
    id: "chapter-number",
    label: "Chapter Number",
    preview: "Chapter 1",
    category: "header",
    placeholder: "Chapter 1",
  },
  {
    id: "chapter-title",
    label: "Chapter Title",
    // Updated per style table: "An overview of Marketing" -> "An Overview of Marketing"
    preview: "An Overview of Marketing",
    category: "header",
    placeholder: "An Overview of Marketing",
  },
  {
    // New per style table: Theme 2 now has its own "Chapter Overview"
    // component alongside the existing "Learning Objectives" one. Added
    // here rather than replacing "learning-objectives" below, since the
    // table didn't say to remove or rename anything.
    id: "chapter-overview",
    label: "Chapter Overview",
    preview: "Learning Outcomes",
    category: "header",
    placeholder: "Learning Outcomes",
  },
  {
    // Updated per style table: Theme 2's Lesson Overview is now a dual
    // (prefix + text) component, matching Figure Caption's pattern, so the
    // "1-1" prefix can be styled separately from the rest of the text.
    id: "lesson-overview",
    label: "Lesson Overview",
    preview: " Define the term marketing",
    previewPrefix: "1-1",
    category: "header",
    placeholder: "1-1",
  },
  {
    id: "lesson-title",
    label: "Lesson Title",
    preview: "1-1 What is Marketing",
    category: "header",
    placeholder: "1-1 What is Marketing",
  },
  {
    id: "section-title",
    label: "Section Title",
    preview: "1-1 Define the term marketing ",
    category: "header",
    placeholder: "1-1 Define the term marketing ",
  },
  {
    id: "sub-section-title",
    label: "Sub Section Title",
    preview: "1-2a Production Orientation",
    category: "header",
    placeholder: "1-2a Production Orientation",
  },
  {
    id: "paragraph-text",
    label: "Paragraph Text",
    preview: "Start typing your text here...",
    category: "text-media",
    placeholder: "",
  },
  {
    id: "image",
    label: "Image",
    preview: null,
    category: "text-media",
    placeholder: null,
  },
  {
    id: "quotation",
    label: "Quotation",
    preview: "“Quotation text goes here.”",
    previewPrefix: null,
    category: "text-media",
    placeholder: "",
  },{
    id: "footer",
    label: "Footer",
    preview: "Footer text goes here.",
    category: "text-media",
    placeholder: "",
  },
];

export const THEME2_STYLES = {
  partNumber: {
    font: "Arial",
    size: 24,
    color: "#FFFFFF",
    bold: false,
    backgroundColor: "#CA5027",
  },

  chapterHeading: {
    font: "Arial",
    size: 36,
    color: "#FFFFFF",
    bold: false,
    backgroundColor: "#CA5027",
  },

  chapterTitle: {
    font: "Arial",
    size: 44,
    color: "#214880",
    bold: false,
  },

  // New per style table: style for the new "chapter-overview" component.
  chapterOverview: {
    font: "Arial",
    size: 15,
    color: "#CA5027",
    bold: true,
  },

  paragraphText: {
    // Updated per style table: font family changed from "Arial" to
    // "Neue Kabel Regular" for Theme 2 body paragraphs.
    font: "Neue Kabel Regular, Arial",
    size: 10,
    color: "#000000",
    bold: false,
  },

  lessonTitle: {
    font: "Arial",
    size: 18,
    color: "#214880",
    bold: true,
  },

  // Updated per style table: now a dual (prefix + text) style, matching
  // `caption` above, instead of a single flat style.
  lessonOverview: {
    text: {
      font: "Arial",
      size: 11,
      color: "#000000",
      bold: false,
    },
    number: {
      font: "Arial",
      size: 11,
      color: "#CA5027",
      bold: true,
    },
  },

  sectionTitle: {
    font: "Arial",
    size: 10,
    color: "#000000",
    bold: false,
  },

  subSectionTitle: {
    font: "Arial",
    size: 15,
    color: "#00854A",
    bold: true,
  },

  // New: Quotation styling for Theme 2 — see THEME1_STYLES.quotationText /
  // quotationAuthor above for the rationale (kept as two separate style
  // objects since the quote and author lines are two separate content
  // controls).
  quotationText: {
    font: "Arial",
    size: 14,
    color: "#214880",
    bold: false,
  },
  quotationAuthor: {
    font: "Arial",
    size: 10.5,
    color: "#214880",
    bold: false,
  },
  footer: {
    font: "Arial",
    size: 9,
    color: "#1A1A1A",
    bold: false,
  },
};

export const THEME2_COMPONENT_CONFIG = {
  "part-number": {
    style: THEME2_STYLES.partNumber,
  },

  "chapter-number": {
    style: THEME2_STYLES.chapterHeading,
  },

  "chapter-title": {
    style: THEME2_STYLES.chapterTitle,
  },

  "chapter-overview": {
    style: THEME2_STYLES.chapterOverview,
  },

  "paragraph-text": {
    style: THEME2_STYLES.paragraphText,
  },

  "lesson-title": {
    style: THEME2_STYLES.lessonTitle,
  },

  "lesson-overview": {
    dual: {
      prefix: "1-1",
      text: " Define the term marketing",
      prefixStyle: THEME2_STYLES.lessonOverview.number,
      textStyle: THEME2_STYLES.lessonOverview.text,
    }
  },

  "section-title": {
    style: THEME2_STYLES.sectionTitle,
  },

  "sub-section-title": {
    style: THEME2_STYLES.subSectionTitle,
  },

  // New: background/box color + per-line text styles used by
  // insertQuotationAtTarget in App.js.
  "quotation": {
    backgroundColor: "#DCE4F0",
    quoteStyle: THEME2_STYLES.quotationText,
    authorStyle: THEME2_STYLES.quotationAuthor,
  },
  "footer": {
    style: THEME2_STYLES.footer,
  }
};

export const THEME_TYPE = {
  theme1: {
    id: "theme1",
    name: "Theme 1",
    COMPONENTS: THEME1_COMPONENTS,
    STYLES: THEME1_STYLES,
    COMPONENT_CONFIG: THEME1_COMPONENT_CONFIG,
  },
  theme2: {
    id: "theme2",
    name: "Theme 2",
    COMPONENTS: THEME2_COMPONENTS,
    STYLES: THEME2_STYLES,
    COMPONENT_CONFIG: THEME2_COMPONENT_CONFIG,
  },
};

export const DEFAULT_THEME = "theme1";

export const LAYOUT_COMPONENTS = [
  {
    id: "opener",
    label: "Opener",
    container: true,
    preview: "",
    placeholder: ""
  },
  {
    id: "non-opener",
    label: "Non Opener",
    container: true,
    preview: "",
    placeholder: ""
  }
];