const STANDARD_SECTION_FONT_WEIGHT = 400;
const STANDARD_SECTION_FONT_SIZE = 14;

// const STANDARD_SUB_SECTION_FONT_WEIGHT = 400;

function checkIsSection(fontWeight, fontSize, fontName) {
  return (
    (fontWeight >= STANDARD_SECTION_FONT_WEIGHT || fontName.includes('BOLD')) &&
    fontSize >= STANDARD_SECTION_FONT_SIZE
  );
}

// async function checkIsSubSection(fontWeight, fontSize, fontName) {
//     return fontWeight >= STANDARD_SUB_SECTION_FONT_WEIGHT && fontName.includes('BOLD');
// }

async function getSectionTitle(line) {
  let section = '';
  for (
    let word = await line.getFirstWord();
    await word.isValid();
    word = await word.getNextWord()
  ) {
    section += (await word.getString()) + ' ';
  }

  return section;
}

async function getCoordinates(docIns, page, line) {
  const bBox = await line.getBBox();
  const coordinate = await bBox.get();
  const pagePoint = docIns.getPDFCoordinates(
    page - 1,
    coordinate.x1,
    coordinate.y1
  );

  return {
    vertical: pagePoint.y,
    horizontal: pagePoint.x,
  };
}

async function extractTextLine(
  docIns,
  page,
  line,
  childrenOfSection,
  sections,
  currentSection,
  isContinuousSection = false
) {
  if (!(await line.isValid())) {
    if (currentSection) {
      currentSection = {
        ...currentSection,
        children: childrenOfSection,
      };
      sections.push(currentSection);
    }
    return sections;
  }
  const style = await line.getStyle();
  const fontSize = await style.getFontSize();
  const fontWeight = await style.getWeight();
  const fontName = await style.getFontName();

  if (checkIsSection(fontWeight, fontSize, fontName.toUpperCase())) {
    if (!isContinuousSection) {
      const coordinate = await getCoordinates(docIns, page, line);
      const title = await getSectionTitle(line);
      const section = {
        title,
        vertical: coordinate.vertical - fontSize,
        horizontal: coordinate.horizontal,
      };
      if (!currentSection) {
        currentSection = section;
      } else {
        currentSection = {
          ...currentSection,
          children: childrenOfSection,
        };
        sections.push(currentSection);
        currentSection = section;
        childrenOfSection = [];
      }
      isContinuousSection = true;
    }
    // } else
    // if (checkIsSubSection(fontWeight, fontSize, fontName.toUpperCase())) {
    //     const coordinate = await getCoordinates(docIns, page, line);
    //     const title = await getSectionTitle(line);
    //     const subSection = {
    //         children: [],
    //         title,
    //         vertical: coordinate.vertical,
    //         horizontal: coordinate.horizontal,
    //     };
    //     childrenOfSection.push(subSection);
    //     isContinuousSection = false;
  } else {
    isContinuousSection = false;
  }
  return await extractTextLine(
    docIns,
    page,
    await line.getNextLine(),
    childrenOfSection,
    sections,
    currentSection,
    isContinuousSection
  );
}

async function getAllSectionOfPage(docIns, pageIns, page) {
  const extractorTool = await PDFNet.TextExtractor.create();
  const rect = new PDFNet.Rect(0, 0, 612, 792);
  const sections = [];
  const childrenOfSection = [];
  extractorTool.begin(
    pageIns,
    rect,
    PDFNet.TextExtractor.ProcessingFlags.e_remove_hidden_text
  );
  const result = await extractTextLine(
    docIns,
    page,
    await extractorTool.getFirstLine(),
    childrenOfSection,
    sections,
    null
  );
  extractorTool.destroy();
  return result;
}

export default {
  getAllSectionOfPage,
  checkIsSection,
  getSectionTitle,
  getCoordinates,
  extractTextLine,
};
