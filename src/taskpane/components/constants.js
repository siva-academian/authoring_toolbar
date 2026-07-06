export const BIOLOGY_COMPONENTS = [
  {
    id: "chapter-number",
    label: "Chapter Number",
    preview: "CHAPTER 01",
    category: "header",
    placeholder: "CHAPTER 01",
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
    label: "Lesson overview",
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
    label: "learning objectives",
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
    id: "figure-image",
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

export const BIOLOGY_STYLES = {
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

export const BIOLOGY_COMPONENT_CONFIG = {
  "chapter-number": {
    style: BIOLOGY_STYLES.chapterHeading,
    allCaps: true,
  },
  "chapter-title": {
    style: BIOLOGY_STYLES.chapterTitle,
  },
  "chapter-overview": {
    style: BIOLOGY_STYLES.chapterOverview,
    allCaps: true,
  },
  "lesson-overview": {
    style: BIOLOGY_STYLES.lessonOverview,
  },
  "lesson-title": {
    style: BIOLOGY_STYLES.lessonTitle,
    allCaps: true,
  },
  "learning-objectives": {
    style: BIOLOGY_STYLES.learningObjectives,
    allCaps: true,
  },
  "paragraph-text": {
    style: BIOLOGY_STYLES.paragrapghText,
  },
  "section-title": {
    style: BIOLOGY_STYLES.sectionTitle,
  },
  "sub-section-title": {
    style: BIOLOGY_STYLES.subSectionTitle,
  },
  "figure-caption": {
    dual: {
      prefix: "FIGURE 1.1",
      text: " Caption text here.",
      prefixStyle: BIOLOGY_STYLES.imageFigureNumber,
      textStyle: BIOLOGY_STYLES.imageFigureText,
    }
  }
};

export const MARKETING_COMPONENTS = [
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
    id: "lesson-title",
    label: "Lesson Title",
    preview: "An overview of Marketing",
    category: "header",
    placeholder: "An overview of Marketing",
  },
  {
    id: "learning-objectives",
    label: "Learning Objectives",
    preview: "Learning Objectives",
    category: "header",
    placeholder: "Learning Objectives",
  },
  {
    id: "paragraph-text",
    label: "Paragraph",
    preview: "Start typing your text here...",
    category: "text-media",
    placeholder: "",
  },
  {
    id: "sub-titles-list",
    label: "Sub Titles List",
    preview: "1.1 Define the term marketing",
    category: "header",
    placeholder: "",
  },
  {
    id: "section-title",
    label: "Section Title",
    preview: "1-1 What is Marketing",
    category: "header",
    placeholder: "1-1 What is Marketing",
  },
  {
    id: "sub-section-title",
    label: "Sub Section Title",
    preview: "1-1 Define the term marketing",
    category: "header",
    placeholder: "1-1 Define the term marketing",
  },
  {
    id: "green-sub-section-title",
    label: "Green Sub Section Title",
    preview: "1-2a Production Orientation",
    category: "header",
    placeholder: "1-2a Production Orientation",
  },
  {
    id: "sub-title",
    label: "Sub Title",
    preview: "Customer Value",
    category: "header",
    placeholder: "Customer Value",
  },
];

export const MARKETING_STYLES = {
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

  lessonTitle: {
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

  subTitlesList: {
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
    text: {
      font: "Arial",
      size: 17,
      color: "#214880",
      bold: true,
    },
    number: {
      font: "Arial",
      size: 18,
      color: "#214880",
      bold: true,
    },
  },

  subSectionTitle: {
    font: "Arial",
    size: 10,
    color: "#000000",
    bold: true,
  },

  greenSubSectionTitle: {
    font: "Arial",
    size: 15,
    color: "#00854A",
    bold: true,
  },

  subTitle: {
    font: "Arial",
    size: 12,
    color: "#CA5027",
    bold: false,
  },
};

export const MARKETING_COMPONENT_CONFIG = {
  "part-number": {
    style: MARKETING_STYLES.partNumber,
  },

  "chapter-number": {
    style: MARKETING_STYLES.chapterHeading,
  },

  "lesson-title": {
    style: MARKETING_STYLES.lessonTitle,
  },

  "learning-objectives": {
    style: MARKETING_STYLES.learningObjectives,
  },

  "paragraph-text": {
    style: MARKETING_STYLES.paragraphText,
  },

  "sub-titles-list": {
    dual: {
      prefix: "1.1",
      text: " Define the term marketing",
      prefixStyle: MARKETING_STYLES.subTitlesList.number,
      textStyle: MARKETING_STYLES.subTitlesList.text,
    }
  },

  "section-title": {
    style: MARKETING_STYLES.sectionTitle,
  },

  "sub-section-title": {
    style: MARKETING_STYLES.subSectionTitle,
  },

  "green-sub-section-title": {
    style: MARKETING_STYLES.greenSubSectionTitle,
  },

  "sub-title": {
    style: MARKETING_STYLES.subTitle,
  },
};

export const BOOKS = {
  biology: {
    id: "biology",
    name: "BIOLOGY",
    COMPONENTS: BIOLOGY_COMPONENTS,
    STYLES: BIOLOGY_STYLES,
    COMPONENT_CONFIG: BIOLOGY_COMPONENT_CONFIG,
  },
  marketing: {
    id: "marketing",
    name: "MARKETING",
    COMPONENTS: MARKETING_COMPONENTS,
    STYLES: MARKETING_STYLES,
    COMPONENT_CONFIG: MARKETING_COMPONENT_CONFIG,
  },
};

export const DEFAULT_BOOK = "biology";