export const COMPONENTS = [
  {
    id: "chapter-number",
    label: "Chapter Number",
    preview: "CHAPTER 01",
    category: "header",
  },
  {
    id: "chapter-title",
    label: "Chapter Title",
    preview: "Introduction to Biology",
    category: "header",
  },
  {
    id: "chapter-overview",
    label: "Chapter Overview",
    preview: "CHAPTER OUTLINE",
    category: "header",
  },
  {
    id: "lesson-overview",
    label: "Lesson overview",
    preview: "1.1 Topic Title",
    category: "header",
  },
  {
    id: "lesson-title",
    label: "Lesson Title",
    preview: "1.1 Themes and Concepts of Biology",
    category: "header",
  },
  {
    id: "learning-objectives",
    label: "learning objectives",
    preview: "LEARNING OBJECTIVES",
    category: "header",
  },
  {
    id: "section-title",
    label: "Section Title",
    preview: "Properties of Life",
    category: "header",
  }, {
    id: "sub-section-title",
    label: "Sub Section Title",
    preview: "order",
    category: "header",
  },
  {
    id: "paragraph-text",
    label: "Paragraph Text",
    preview: "Start typing your text here...",
    category: "text-media",
  },
  {
    id: "figure-image",
    label: "Image",
    preview: null,
    category: "text-media",
  },
  {
    id: "figure-caption",
    label: "Caption",
    preview: "caption",
    previewPrefix: "FIGURE 1.1",
    category: "text-media",
  },
  {
    id: "logo-with-text",
    label: "Logo with Text",
    description: "Small logo + editable learning link text",
    preview: "logo  Start typing...",
    category: "header",
  },
];

export const STYLES = {
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
    bold: true,
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
    bold: true,
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

export const COMPONENT_CONFIG = {
  "chapter-number": {
    style: STYLES.chapterHeading,
    allCaps: true,
  },
  "chapter-title": {
    style: STYLES.chapterTitle,
  },
  "chapter-overview": {
    style: STYLES.chapterOverview,
    allCaps: true,
  },
  "lesson-overview": {
    style: STYLES.lessonOverview,
  },
  "lesson-title": {
    style: STYLES.lessonTitle,
    allCaps: true,
  },
  "learning-objectives": {
    style: STYLES.learningObjectives,
    allCaps: true,
  },
  "paragraph-text": {
    style: STYLES.paragrapghText,
  },
  "section-title": {
    style: STYLES.sectionTitle,
  },
  "sub-section-title": {
    style: STYLES.subSectionTitle,
  },
};