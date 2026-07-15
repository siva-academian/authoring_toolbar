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
    id: "learning-objectives",
    label: "Learning Objectives",
    preview: "LEARNING OBJECTIVES",
    category: "header",
    placeholder: "LEARNING OBJECTIVES",
  },
  {
    id: "section-title",
    label: "Section Title",
    preview: "Properties of Life",
    category: "header",
    placeholder: "Properties of Life",
  }, {
    id: "sub-section-title",
    label: "Sub Section Title",
    preview: "order",
    category: "header",
    placeholder: "order",
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
  learningObjectives: {
    font: "Arial",
    size: 9,
    color: "#0074BC",
    bold: true,
  },
  sectionTitle: {
    font: "Arial",
    size: 11,
    color: "#0074BC",
    bold: false,
  },
  subSectionTitle: {
    font: "Arial",
    size: 9,
    color: "#0074BC",
    bold: true,
  },
  paragrapghText: {
    font: "Arial",
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
  }
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
  "learning-objectives": {
    style: THEME1_STYLES.learningObjectives,
    allCaps: true,
  },
  "paragraph-text": {
    style: THEME1_STYLES.paragrapghText,
  },
  "section-title": {
    style: THEME1_STYLES.sectionTitle,
  },
  "sub-section-title": {
    style: THEME1_STYLES.subSectionTitle,
  },
  "figure-caption": {
    dual: {
      prefix: "FIGURE 1.1",
      text: " Caption text here.",
      prefixStyle: THEME1_STYLES.imageFigureNumber,
      textStyle: THEME1_STYLES.imageFigureText,
    }
  }
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
    preview: "An overview of Marketing",
    category: "header",
    placeholder: "An overview of Marketing",
  },
  {
    id: "learning-objectives",
    label: "Learning Objectives",
    preview: "Learning Outcomes",
    category: "header",
    placeholder: "Learning Outcomes",
  },
  {
    id: "paragraph-text",
    label: "Paragraph Text",
    preview: "Start typing your text here...",
    category: "text-media",
    placeholder: "",
  },
  {
    id: "figure-caption",
    label: "Caption",
    preview: " Define the term marketing",
    previewPrefix: "1-1",
    category: "text-media",
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
    id: "lesson-overview",
    label: "Lesson Overview",
    preview: "1-1 Define the term marketing",
    category: "header",
    placeholder: "1-1 Define the term marketing",
  },
  {
    id: "section-title",
    label: "Section Title",
    preview: "1-2a Production Orientation",
    category: "header",
    placeholder: "1-2a Production Orientation",
  },
  {
    id: "sub-section-title",
    label: "Sub Section Title",
    preview: "Customer Value",
    category: "header",
    placeholder: "Customer Value",
  },
  {
    id: "image",
    label: "Image",
    preview: null,
    category: "text-media",
    placeholder: null,
  }
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

  learningObjectives: {
    font: "Arial",
    size: 15,
    color: "#CA5027",
    bold: true,
  },

  paragraphText: {
    font: "Arial",
    size: 10,
    color: "#000000",
    bold: false,
  },

  caption: {
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

  lessonTitle: {
    font: "Arial",
    size: 18,
    color: "#214880",
    bold: true,
  },

  lessonOverview: {
    font: "Arial",
    size: 10,
    color: "#000000",
    bold: true,
  },

  sectionTitle: {
    font: "Arial",
    size: 15,
    color: "#00854A",
    bold: true,
  },

  subSectionTitle: {
    font: "Arial",
    size: 12,
    color: "#CA5027",
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

  "learning-objectives": {
    style: THEME2_STYLES.learningObjectives,
  },

  "paragraph-text": {
    style: THEME2_STYLES.paragraphText,
  },

  "figure-caption": {
    dual: {
      prefix: "1.1",
      text: " Define the term marketing",
      prefixStyle: THEME2_STYLES.caption.number,
      textStyle: THEME2_STYLES.caption.text,
    }
  },

  "lesson-title": {
    style: THEME2_STYLES.lessonTitle,
  },

  "lesson-overview": {
    style: THEME2_STYLES.lessonOverview,
  },

  "section-title": {
    style: THEME2_STYLES.sectionTitle,
  },

  "sub-section-title": {
    style: THEME2_STYLES.subSectionTitle,
  },
};

export const PAGE_TYPE = {
  firstTheme: {
    id: "first-theme",
    name: "Theme 1",
    COMPONENTS: THEME1_COMPONENTS,
    STYLES: THEME1_STYLES,
    COMPONENT_CONFIG: THEME1_COMPONENT_CONFIG,
  },
  secondTheme: {
    id: "second-theme",
    name: "Theme 2",
    COMPONENTS: THEME2_COMPONENTS,
    STYLES: THEME2_STYLES,
    COMPONENT_CONFIG: THEME2_COMPONENT_CONFIG,
  },
};

export const DEFAULT_PAGE = "firstTheme";

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