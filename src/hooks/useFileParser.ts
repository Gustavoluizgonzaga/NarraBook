import { BookData, Chapter } from '../types';

declare global {
  interface Window {
    ePub: any;
    pdfjsLib: any;
  }
}

export const useFileParser = () => {
  const parseTxt = (file: File): Promise<BookData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const paragraphs = text
          .split(/\n{2,}/)
          .map(p => p.trim())
          .filter(p => p.length > 20);
        
        const chapters: Chapter[] = [];
        const PARAGRAPHS_PER_PART = 50; // Approximates to a few pages
        
        for (let i = 0; i < paragraphs.length; i += PARAGRAPHS_PER_PART) {
          const partNum = Math.floor(i / PARAGRAPHS_PER_PART) + 1;
          chapters.push({
            id: `part-${partNum}`,
            title: `Parte ${partNum}`,
            startIndex: i
          });
        }

        // Fallback if no paragraphs
        if (chapters.length === 0) {
          chapters.push({ id: 'main', title: 'Início', startIndex: 0 });
        }
        
        resolve({
          metadata: {
            title: file.name.replace('.txt', ''),
            format: 'txt'
          },
          paragraphs,
          chapters
        });
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const parseEpub = async (file: File): Promise<BookData> => {
    const book = window.ePub(await file.arrayBuffer());
    const metadata = await book.loaded.metadata;
    const coverUrl = await book.coverUrl();
    const spine = await book.loaded.spine;
    
    const paragraphs: string[] = [];
    const chapters: Chapter[] = [];

    for (const section of spine.spineItems) {
      await section.load(book.load.bind(book));
      const doc = section.document;
      const title = section.cfiBase || 'Capítulo';
      
      const startIndex = paragraphs.length;

      const sectionParagraphs = Array.from(doc.querySelectorAll('p, h1, h2, h3, h4'))
        .map((el: any) => el.textContent.trim())
        .filter(text => text.length > 10);
      
      if (sectionParagraphs.length > 0) {
        chapters.push({
          id: section.idref,
          title: title,
          startIndex: startIndex
        });
      }

      paragraphs.push(...sectionParagraphs);
      section.unload();
    }

    if (chapters.length === 0) {
      chapters.push({ id: 'main', title: 'Início', startIndex: 0 });
    }

    return {
      metadata: {
        title: metadata.title,
        author: metadata.creator,
        cover: coverUrl,
        format: 'epub'
      },
      paragraphs,
      chapters
    };
  };

  const parsePdf = async (file: File): Promise<BookData> => {
    const pdfjsLib = window.pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    const loadingTask = pdfjsLib.getDocument(await file.arrayBuffer());
    const pdf = await loadingTask.promise;
    
    const paragraphs: string[] = [];
    const chapters: Chapter[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const startIndex = paragraphs.length;
      
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      // Simple paragraph splitting for PDF
      const pageParagraphs = pageText
        .split(/\.\s+/)
        .map(p => p.trim() + '.')
        .filter(p => p.length > 20);
      
      if (pageParagraphs.length > 0) {
        chapters.push({
          id: `page-${i}`,
          title: `Página ${i}`,
          startIndex: startIndex
        });
        paragraphs.push(...pageParagraphs);
      }
    }

    if (chapters.length === 0) {
      chapters.push({ id: 'main', title: 'Documento Completo', startIndex: 0 });
    }

    return {
      metadata: {
        title: file.name.replace('.pdf', ''),
        format: 'pdf'
      },
      paragraphs,
      chapters
    };
  };

  const parseFile = async (file: File): Promise<BookData> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'txt':
        return parseTxt(file);
      case 'epub':
        return parseEpub(file);
      case 'pdf':
        return parsePdf(file);
      default:
        throw new Error('Formato de arquivo não suportado');
    }
  };

  return { parseFile };
};
