declare module 'html2pdf.js' {
  export interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: {
      type: string;
      quality: number;
    };
    html2canvas?: {
      scale: number;
    };
    jsPDF?: {
      orientation: string;
      unit: string;
      format: string;
    };
    pagebreak?: {
      mode: string[];
    };
  }

  export interface Html2PdfInstance {
    set(options: Html2PdfOptions): Html2PdfInstance;
    from(source: string | HTMLElement): Html2PdfInstance;
    save(): void;
    output(type: string): any;
    canvas(): any;
    pdf(): any;
  }

  export default function html2pdf(): Html2PdfInstance;
}
